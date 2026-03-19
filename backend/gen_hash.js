const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10).then(hash => {
  console.log('New Hash:', hash);
}).catch(err => {
  console.error('Error:', err);
});
