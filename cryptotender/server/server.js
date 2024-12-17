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


const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error('Missing required environment variables. Check .env.')
  console.error(RPC_URL);
  console.error(PRIVATE_KEY);
  console.error(CONTRACT_ADDRESS);
  process.exit(1);
}

const web3 = new Web3(RPC_URL) ;

web3.eth.accounts.wallet.add(PRIVATE_KEY);
const account = web3.eth.accounts.wallet[0].address;

const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

console.log('Connected to Infura via RPC:', RPC_URL);
console.log('Using account:', account);

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

async function closeTender(tenderId) {
  try {
    console.log(`Attempting to close tender with ID: ${tenderId}`);

    // Estimate gas requirement
    const gas = await contract.methods.closeTender(tenderId).estimateGas({ from: account });
    console.log(`Estimated gas for closing tender ${tenderId}: ${gas}`);

    // Send the transaction
    const tx = await contract.methods.closeTender(tenderId).send({ from: account, gas });
    console.log(`Tender ${tenderId} closed successfully! Tx hash: ${tx.transactionHash}`);

  } catch (error) {
    console.error(`Error closing tender with ID ${tenderId}:`, error.message || error);
  }
}

async function checkAndCloseExpiredTenders() {
  try {
    const tenders = await contract.methods.getTenders().call(); // Fetch all tenders


    const currentTime = Math.floor(Date.now() / 1000); // Get current timestamp in seconds

    for (const tender of tenders) {
      try {
        if (tender.isOpen && currentTime >= tender.endTime) {
          await closeTender(tender.id); // Close the tender if it's open and past its end time
        }
      } catch (error) {
        console.error(`Error closing tender with ID ${tender.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking and closing expired tenders:', error);
  }
}

checkConnection();

setInterval(checkAndCloseExpiredTenders, 30000);

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