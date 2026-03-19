const bcrypt = require('bcryptjs');
const hash = '$2b$10$R9h/lSAbvI7.yYF6HwG8Ju9zR.N/.JmFjO3Xf.zGZ7H/7O.X.o.mG';
const password = 'admin123';

bcrypt.compare(password, hash).then(res => {
  console.log('Match:', res);
}).catch(err => {
  console.error('Error:', err);
});
