CREATE DATABASE IF NOT EXISTS asset_db;
USE asset_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('admin', 'staff', 'viewer') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial admin user (password: admin123 hashed with bcrypt)
INSERT INTO users (username, password, full_name, role) VALUES 
('admin', '$2b$10$rF3zbB8y7FvcObQizGeLXO2/Ca853iHHwUeXKtqWUFcxOPLMqQSQK', 'System Administrator', 'admin');

CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'Room',
    description TEXT
);

CREATE TABLE IF NOT EXISTS owners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name) VALUES 
('Asset IT'), ('Asset School'), ('Asset Garden'), 
('Asset Event'), ('Asset Office'), ('Asset Principal and Director');

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    status ENUM('Available', 'Borrow', 'maintenance', 'End of Life', 'Pending Disposal') DEFAULT 'Available',
    location VARCHAR(255),
    asset_tag VARCHAR(100),
    serial_number VARCHAR(255) DEFAULT NULL,
    owner VARCHAR(255),
    start_date DATE,
    warranty_date DATE,
    status_symbol VARCHAR(50) DEFAULT 'Circle',
    is_locked BOOLEAN DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO locations (name, description) VALUES
('IT Lab', 'Main computer lab for students'),
('Science Room', 'Laboratory for physics and chemistry'),
('Main Field', 'Outdoor sports and events area'),
('Principal Office', 'Executive office section'),
('Garden Shed', 'Storage for landscape tools');

INSERT INTO owners (name, department, email) VALUES
('Somchai IT', 'IT Department', 'somchai@school.com'),
('Dr. Somsak', 'Science Faculty', 'somsak@school.com'),
('Manager Anne', 'Events', 'anne@school.com'),
('Director Jane', 'Administration', 'jane@school.com');

CREATE TABLE IF NOT EXISTS maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    maintenance_type ENUM('Repair', 'Cleaning', 'Upgrade', 'Inspection') NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2),
    maintenance_date DATE,
    completion_date DATE,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    provider VARCHAR(255)
);

INSERT INTO maintenance (item_id, maintenance_type, description, cost, maintenance_date, status, provider) VALUES
(1, 'Repair', 'Screen flickering issue', 150.00, '2024-03-10', 'In Progress', 'FixIT Services'),
(2, 'Cleaning', 'Annual lens cleaning', 50.00, '2024-02-15', 'Completed', 'LabCare'),
(5, 'Upgrade', 'Battery replacement', 80.00, '2024-03-12', 'Pending', 'GardenFix');

CREATE TABLE IF NOT EXISTS software (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(100),
    vendor VARCHAR(255),
    license_key VARCHAR(255),
    license_type ENUM('Perpetual', 'Subscription', 'Open Source', 'Trial', 'Other') DEFAULT 'Perpetual',
    cost DECIMAL(10, 2) DEFAULT 0,
    billing_period ENUM('Monthly', 'Yearly', 'One-time', 'Free') DEFAULT 'Yearly',
    install_date DATE,
    expiry_date DATE,
    assigned_to VARCHAR(255),
    location VARCHAR(255),
    status ENUM('Active', 'Expired', 'Unassigned') DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

