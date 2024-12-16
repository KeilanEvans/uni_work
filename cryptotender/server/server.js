const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const app = express();

const usersFilePath = path.join(__dirname, 'users.json');

app.use(bodyParser.json());

const readUsersFromFile = () => {
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }
  const usersData = fs.readFileSync(usersFilePath);
  return JSON.parse(usersData);
};

const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, address } = req.body;
    const users = readUsersFromFile();
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, address });
    writeUsersToFile(users);
    res.status(201).send('User registered');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', username);
    const users = readUsersFromFile();
    console.log('Users:', users); // Log the users array
    const user = users.find(u => u.username === username);
    if (!user) {
      console.log('User not found');
      return res.status(400).send({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid); // Log the result of password comparison
    if (!isPasswordValid) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }
    // Generate a token or session here
    res.send({ token: 'your-jwt-token' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});