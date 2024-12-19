require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();

const { Web3 } = require('web3');
const abi = require('../src/abi.json');
const usersFilePath = path.join(__dirname, 'users.json');

// Load environment variables
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Check if required environment variables are set
if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error('Missing required environment variables. Check .env.');
  console.error(RPC_URL);
  console.error(PRIVATE_KEY);
  console.error(CONTRACT_ADDRESS);
  process.exit(1);
}

// Initialize Web3 instance
const web3 = new Web3(RPC_URL);

// Add private key to Web3 wallet
web3.eth.accounts.wallet.add(PRIVATE_KEY);
const account = web3.eth.accounts.wallet[0].address;

// Initialize contract instance
const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

console.log('Connected to Infura via RPC:', RPC_URL);
console.log('Using account:', account);

// Function to check connection to the Ethereum network
async function checkConnection() {
  try {
    // Get network ID
    const networkId = await web3.eth.net.getId();
    console.log('Connected to network ID:', networkId);

    // Check balance of the account
    const balance = await web3.eth.getBalance(account);
    console.log('Account balance (ETH):', web3.utils.fromWei(balance, 'ether'));
  } catch (error) {
    console.error('Error connecting to the Ethereum network:', error);
  }
}

// Function to close a tender
async function closeTender(tenderId) {
  try {
    console.log(`Attempting to close tender with ID: ${tenderId}`);

    // Estimate gas for closing the tender
    const gas = await contract.methods.closeTender(tenderId).estimateGas({ from: account });
    console.log(`Estimated gas for closing tender ${tenderId}: ${gas}`);

    // Send transaction to close the tender
    const tx = await contract.methods.closeTender(tenderId).send({ from: account, gas });
    console.log(`Tender ${tenderId} closed successfully! Tx hash: ${tx.transactionHash}`);
  } catch (error) {
    console.error(`Error closing tender with ID ${tenderId}:`, error.message || error);
  }
}

// Function to check and close expired tenders
async function checkAndCloseExpiredTenders() {
  try {
    // Get all tenders from the contract
    const tenders = await contract.methods.getTenders().call();

    // Get current time in Unix timestamp
    const currentTime = Math.floor(Date.now() / 1000);

    // Iterate through tenders and close expired ones
    for (const tender of tenders) {
      try {
        if (tender.isOpen && currentTime >= tender.endTime) {
          await closeTender(tender.id);
        }
      } catch (error) {
        console.error(`Error closing tender with ID ${tender.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking and closing expired tenders:', error);
  }
}

// Check connection to the Ethereum network
checkConnection();

// Set interval to check and close expired tenders every 30 seconds
setInterval(checkAndCloseExpiredTenders, 30000);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Function to read users from file
const readUsersFromFile = () => {
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }
  const usersData = fs.readFileSync(usersFilePath);
  return JSON.parse(usersData);
};

// Function to write users to file
const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Endpoint to register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, address, permission } = req.body;
    const users = readUsersFromFile();

    // Check if username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(400).send({ message: 'Username already exists.' });
    }

    // Hash the password and save the user
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, address, permission });
    writeUsersToFile(users);

    res.status(201).send('User registered');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Endpoint to login a user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', username);
    const users = readUsersFromFile();

    // Find user by username
    const user = users.find(u => u.username === username);
    if (!user) {
      console.log('User not found');
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    res.send({ token: 'your-jwt-token' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});