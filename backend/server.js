const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const os = require('os');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'asset-mgmt-secret-2024';

const app = express();
const port = 4001;

// Proper CORS configuration
app.use(cors({
    origin: true, // Allow all origins for local network access
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'asset_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection((err, conn) => {
  if (err) console.error('Database connection failed:', err);
  else {
    console.log('Connected to MySQL database');
  }
});

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  pool.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role }
    });
  });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
};

// GET endpoint to fetch all items
app.get('/api/items', (req, res) => {
  pool.query('SELECT * FROM items ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Error fetching items:', err);
      return res.status(500).json({ error: 'Database error fetching items' });
    }
    res.json(results);
  });
});

// GET endpoint to fetch a single item by ID
app.get('/api/items/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM items WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching item:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(results[0]);
  });
});

// POST endpoint to add a new item
app.post('/api/items', verifyToken, (req, res) => {
  const { name, category, status, location, asset_tag, owner, start_date, warranty_date, status_symbol } = req.body;
  const initialStatus = status || 'Available';
  
  // Sanitize dates
  const sDate = start_date || null;
  const wDate = warranty_date || null;

  const query = 'INSERT INTO items (name, category, status, location, asset_tag, owner, start_date, warranty_date, status_symbol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  pool.query(query, [name, category, initialStatus, location, asset_tag, owner, sDate, wDate, status_symbol || 'Circle'], (err, result) => {
    if (err) {
      console.error('Error adding item:', err);
      return res.status(500).json({ error: 'Database error adding item' });
    }
    res.status(201).json({ id: result.insertId, name, category, status: initialStatus, location, asset_tag, owner, start_date: sDate, warranty_date: wDate, status_symbol });
  });
});

// Helper to ensure maintenance record exists if status is "maintenance"
const ensureMaintenanceRecord = (itemId, status) => {
  if (status === 'maintenance' || status === 'Maintenance') {
    // Check if an active (non-completed) maintenance record already exists
    pool.query('SELECT id FROM maintenance WHERE item_id = ? AND status != "Completed"', [itemId], (err, results) => {
      if (err) return console.error('Error checking existing maintenance:', err);
      if (results.length === 0) {
        // Create new record
        const mQuery = `INSERT INTO maintenance (item_id, maintenance_type, maintenance_date, description, status) VALUES (?, 'Repair', CURDATE(), 'Automated entry via status change', 'Pending')`;
        pool.query(mQuery, [itemId], (err2) => {
          if (err2) console.error('Error auto-creating maintenance record:', err2);
        });
      }
    });
  }
};

// PATCH endpoint to update status
app.patch('/api/items/:id/status', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 
  
  const query = 'UPDATE items SET status = ? WHERE id = ? AND is_locked = 0';
  pool.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating status:', err);
      return res.status(500).json({ error: 'Database error updating status' });
    }
    if (result.affectedRows === 0) return res.status(403).json({ error: 'Asset is locked or not found' });
    
    // Auto-create maintenance record if needed
    ensureMaintenanceRecord(id, status);

    res.json({ message: 'Status updated successfully', id, status });
  });
});

// PUT endpoint to update entire item
app.put('/api/items/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, category, status, location, asset_tag, owner, start_date, warranty_date, status_symbol } = req.body;
  
  // Sanitize dates
  const sDate = start_date || null;
  const wDate = warranty_date || null;

  const query = `
    UPDATE items 
    SET name=?, category=?, status=?, location=?, asset_tag=?, owner=?, start_date=?, warranty_date=?, status_symbol=? 
    WHERE id=? AND is_locked = 0
  `;
  const params = [name, category, status, location, asset_tag, owner, sDate, wDate, status_symbol || 'Circle', id];
  
  pool.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating item:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(403).json({ error: 'Asset is locked or not found' });
    
    // Auto-create maintenance record if needed
    ensureMaintenanceRecord(id, status);

    res.json({ message: 'Item updated successfully', id });
  });
});

// PATCH endpoint to toggle lock
app.patch('/api/items/:id/lock', verifyToken, (req, res) => {
  const { id } = req.params;
  const { is_locked } = req.body;
  
  const query = 'UPDATE items SET is_locked = ? WHERE id = ?';
  pool.query(query, [is_locked ? 1 : 0, id], (err, result) => {
    if (err) {
      console.error('Error toggling lock:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: `Item ${is_locked ? 'locked' : 'unlocked'} successfully`, id, is_locked });
  });
});

// DELETE endpoint to remove item
app.delete('/api/items/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM items WHERE id = ? AND is_locked = 0';
  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting item:', err);
      return res.status(500).json({ error: 'Database error deleting item' });
    }
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'Asset is locked or not found' });
    }
    res.json({ message: 'Item deleted successfully', id });
  });
});

// Generic helper for CRUD logging
const logError = (msg, err) => console.error(`${msg}:`, err);

// Locations API
app.get('/api/locations', (req, res) => {
  const query = `
    SELECT l.*, 
    (SELECT COUNT(*) FROM items i WHERE i.location = l.name) as asset_count 
    FROM locations l
  `;
  pool.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching locations' });
    res.json(results);
  });
});

app.post('/api/locations', verifyToken, (req, res) => {
  const { name, type } = req.body;
  if (!name) return res.status(400).json({ error: 'Location name is required' });

  const query = 'INSERT INTO locations (name, type) VALUES (?, ?)';
  pool.query(query, [name, type || 'Room'], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error creating location' });
    res.status(201).json({ id: result.insertId, name, type: type || 'Room' });
  });
});

app.put('/api/locations/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;
  if (!name) return res.status(400).json({ error: 'Location name is required' });

  // Also update items that reference the old location name
  pool.query('SELECT name FROM locations WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Location not found' });
    const oldName = results[0].name;

    pool.query('UPDATE locations SET name=?, type=? WHERE id=?', [name, type || 'Room', id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error updating location' });
      // Cascade name change to items
      pool.query('UPDATE items SET location=? WHERE location=?', [name, oldName], () => {});
      res.json({ message: 'Location updated successfully', id, name, type });
    });
  });
});

app.delete('/api/locations/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM locations WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error deleting location' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Location not found' });
    res.json({ message: 'Location deleted successfully', id });
  });
});

// Owners API
app.get('/api/owners', (req, res) => {
  const query = `
    SELECT o.*, 
    (SELECT COUNT(*) FROM items i WHERE i.owner = o.name) as asset_count 
    FROM owners o
  `;
  pool.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching owners' });
    res.json(results);
  });
});

app.post('/api/owners', verifyToken, (req, res) => {
  const { name, department } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const query = 'INSERT INTO owners (name, department) VALUES (?, ?)';
  pool.query(query, [name, department || 'General'], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error creating owner' });
    res.status(201).json({ id: result.insertId, name, department: department || 'General' });
  });
});

app.put('/api/owners/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, department } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  // Also update items that reference the old owner name
  pool.query('SELECT name FROM owners WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Owner not found' });
    const oldName = results[0].name;

    pool.query('UPDATE owners SET name=?, department=? WHERE id=?', [name, department || 'General', id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error updating owner' });
      // Cascade name change to items
      pool.query('UPDATE items SET owner=? WHERE owner=?', [name, oldName], () => {});
      res.json({ message: 'Owner updated successfully', id, name, department });
    });
  });
});

app.delete('/api/owners/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM owners WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error deleting owner' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Owner not found' });
    res.json({ message: 'Owner deleted successfully', id });
  });
});

// Maintenance API
app.get('/api/maintenance', (req, res) => {
  const query = `
    SELECT m.*, i.name as item_name 
    FROM maintenance m 
    JOIN items i ON m.item_id = i.id 
    ORDER BY m.maintenance_date DESC
  `;
  pool.query(query, (err, results) => {
    if (err) {
      logError('Error fetching maintenance', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/maintenance', verifyToken, (req, res) => {
  const { item_id, maintenance_type, maintenance_date, description, cost, provider, status } = req.body;
  if (!item_id || !maintenance_date) return res.status(400).json({ error: 'Item ID and Date are required' });

  const query = `
    INSERT INTO maintenance (item_id, maintenance_type, maintenance_date, description, cost, provider, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [item_id, maintenance_type || 'Repair', maintenance_date, description, cost || 0, provider, status || 'Pending'];
  
  pool.query(query, params, (err, result) => {
    if (err) {
      logError('Error creating maintenance', err);
      return res.status(500).json({ error: 'Database error creating maintenance' });
    }
    
    // Proactively update asset status to 'maintenance' if it's not already
    pool.query('UPDATE items SET status = "maintenance" WHERE id = ?', [item_id], (err2) => {
      if (err2) console.error('Error auto-updating asset status to maintenance:', err2);
    });

    res.status(201).json({ id: result.insertId, message: 'Maintenance scheduled successfully' });
  });
});

app.patch('/api/maintenance/:id/status', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  // 1. Get the item_id first to potentially update its status
  pool.query('SELECT item_id FROM maintenance WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ error: 'Maintenance record not found' });
    
    const { item_id } = results[0];

    // 2. Update maintenance status
    pool.query('UPDATE maintenance SET status = ? WHERE id = ?', [status, id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error updating status' });

      // 3. If completed, restore asset status to Available
      if (status === 'Completed') {
        pool.query('UPDATE items SET status = "Available" WHERE id = ?', [item_id], (err3) => {
          if (err3) console.error('Error auto-restoring asset status:', err3);
          res.json({ message: 'Maintenance status updated successfully', id, status });
        });
      } else {
        // If not completed, ensure asset status is maintenance
        pool.query('UPDATE items SET status = "maintenance" WHERE id = ?', [item_id], (err3) => {
          if (err3) console.error('Error auto-syncing asset status to maintenance:', err3);
          res.json({ message: 'Maintenance status updated successfully', id, status });
        });
      }
    });
  });
});

// Stats API for Dashboard
app.get('/api/stats', (req, res) => {
  const queries = {
    totalAssets: 'SELECT COUNT(*) as count FROM items',
    borrowedAssets: 'SELECT COUNT(*) as count FROM items WHERE status = "Borrow"',
    totalLocations: 'SELECT COUNT(*) as count FROM locations',
    pendingMaintenance: 'SELECT COUNT(*) as count FROM maintenance WHERE status != "Completed"'
  };
  
  const stats = {};
  const queryKeys = Object.keys(queries);
  let completed = 0;
  
  queryKeys.forEach(key => {
    pool.query(queries[key], (err, results) => {
      if (!err) stats[key] = results[0].count;
      completed++;
      if (completed === queryKeys.length) res.json(stats);
    });
  });
});

// User Management APIs
app.get('/api/users', verifyToken, (req, res) => {
  pool.query('SELECT id, username, full_name, role, created_at FROM users ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching users' });
    res.json(results);
  });
});

app.post('/api/users', verifyToken, async (req, res) => {
  const { username, password, full_name, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)';
    pool.query(query, [username, hashedPassword, full_name, role || 'staff'], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Username already exists' });
        return res.status(500).json({ error: 'Database error creating user' });
      }
      res.status(201).json({ id: result.insertId, username, full_name, role: role || 'staff' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Hashing error' });
  }
});

app.delete('/api/users/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  // Prevent deleting self
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  pool.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error deleting user' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully', id });
  });
});

app.patch('/api/users/:id/password', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'New password is required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error updating password' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'Password reset successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Hashing error' });
  }
});

// Software API
app.get('/api/software', (req, res) => {
  pool.query('SELECT * FROM software ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching software' });
    res.json(results);
  });
});

app.post('/api/software', verifyToken, (req, res) => {
  const { name, version, vendor, license_key, license_type, cost, billing_period, install_date, expiry_date, assigned_to, location, status, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Software name is required' });

  const query = `INSERT INTO software (name, version, vendor, license_key, license_type, cost, billing_period, install_date, expiry_date, assigned_to, location, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [name, version, vendor, license_key, license_type || 'Perpetual', cost || 0, billing_period || 'Yearly',
    install_date || null, expiry_date || null, assigned_to, location, status || 'Active', notes];

  pool.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error creating software' });
    res.status(201).json({ id: result.insertId, name });
  });
});

app.put('/api/software/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, version, vendor, license_key, license_type, cost, billing_period, install_date, expiry_date, assigned_to, location, status, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Software name is required' });

  const query = `UPDATE software SET name=?, version=?, vendor=?, license_key=?, license_type=?, cost=?, billing_period=?,
    install_date=?, expiry_date=?, assigned_to=?, location=?, status=?, notes=? WHERE id=?`;
  const params = [name, version, vendor, license_key, license_type, cost || 0, billing_period,
    install_date || null, expiry_date || null, assigned_to, location, status, notes, id];

  pool.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error updating software' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Software not found' });
    res.json({ message: 'Software updated successfully', id });
  });
});

app.delete('/api/software/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM software WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error deleting software' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Software not found' });
    res.json({ message: 'Software deleted successfully', id });
  });
});

// Server Info API
app.get('/api/server-info', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];
  for (const k in networkInterfaces) {
      for (const k2 in networkInterfaces[k]) {
          const address = networkInterfaces[k][k2];
          if (address.family === 'IPv4' && !address.internal) {
              addresses.push(address.address);
          }
      }
  }
  res.json({ 
    ip: addresses[0] || 'localhost',
    port: 4000 // Default frontend port
  });
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

