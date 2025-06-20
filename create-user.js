const bcrypt = require('bcrypt');
const db = require('./database');

async function createTestUser() {
  const username = 'test';
  const password = 'test123';
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err) => {
      if (err) {
        console.error('Error creating test user:', err);
      } else {
        console.log('Test user created successfully');
      }
      db.close();
    }
  );
}

createTestUser(); 