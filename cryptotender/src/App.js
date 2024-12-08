import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Papa from 'papaparse'; // For parsing CSV
import { saveAs } from 'file-saver'; // For downloading CSV
import './App.css';
import logo from './eebay.svg';

// Replace with your contract ABI and address
const CONTRACT_ABI = []; // Add your compiled contract ABI here
const CONTRACT_ADDRESS = "0xYourContractAddress"; // Add your deployed contract address here

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // Tracks the current page
  const [tenders, setTenders] = useState([]); // Tracks tender data
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  useEffect(() => {
    // Initialize Web3 and Contract
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3(Web3.givenProvider || "http://localhost:8545");
        const accounts = await web3Instance.eth.requestAccounts();
        const tenderContract = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setContract(tenderContract);

        console.log("Connected to blockchain:", accounts[0]);
      } catch (error) {
        console.error("Error connecting to Web3:", error);
      }
    };

    initWeb3();
  }, []);

  const handleLogin = async () => {
    const response = await fetch('./users.csv');
    const csvData = await response.text();

    Papa.parse(csvData, {
      header: true,
      complete: (result) => {
        const users = result.data;
        const username = prompt("Enter Username:");
        const password = prompt("Enter Password:");
        const user = users.find((u) => u.username === username && u.password === password);

        if (user) {
          alert("Login Successful");
          setIsLoggedIn(true);
        } else {
          alert("Invalid credentials");
        }
      },
    });
  };

  const handleRegister = async () => {
    const username = prompt("Choose a Username:");
    const password = prompt("Choose a Password:");

    const response = await fetch('./users.csv');
    const csvData = await response.text();

    Papa.parse(csvData, {
      header: true,
      complete: (result) => {
        const users = result.data;
        const userExists = users.some((u) => u.username === username);

        if (userExists) {
          alert("Username already exists. Please choose another.");
          return;
        }

        // Append new user
        users.push({ username, password });

        // Convert back to CSV
        const updatedCSV = Papa.unparse(users);

        // Download updated CSV
        const blob = new Blob([updatedCSV], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'users.csv');

        alert("Registration Successful. Please log in.");
      },
    });
  };

  const calculateTimeLeft = (endTime) => {
    const now = new Date().getTime();
    const timeLeft = endTime - now;
    if (timeLeft > 0) {
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
    return 'Voting Ended';
  };

  const handleCreateTender = async (name, endTime) => {
    try {
      await contract.methods.createTender(name, endTime).send({ from: account });
      alert("Tender Created Successfully");
    } catch (error) {
      console.error("Error creating tender:", error);
    }
  };

  const handleVote = async (tenderId) => {
    try {
      await contract.methods.vote(tenderId).send({ from: account });
      alert("Vote Submitted Successfully");
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handlePlaceBid = async (tenderId, bidAmount) => {
    try {
      await contract.methods.placeBid(tenderId).send({
        from: account,
        value: web3.utils.toWei(bidAmount, "ether"),
      });
      alert("Bid Placed Successfully");
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  };

  const handleEditBid = async (tenderId, newBidAmount) => {
    try {
      await contract.methods.reviseBid(tenderId).send({
        from: account,
        value: web3.utils.toWei(newBidAmount, "ether"),
      });
      alert("Bid Updated Successfully");
    } catch (error) {
      console.error("Error editing bid:", error);
    }
  };

  const renderPage = () => {
    if (currentPage === 'create-tender') {
      return (
        <div className="App">
          <h1>Create a Tender</h1>
          <label>
            Tender Name:
            <input type="text" id="tender-name" className="input" />
          </label>
          <label>
            End Time (Unix Timestamp):
            <input type="number" id="tender-end-time" className="input" />
          </label>
          <button
            className="button"
            onClick={() =>
              handleCreateTender(
                document.getElementById("tender-name").value,
                document.getElementById("tender-end-time").value
              )
            }
          >
            Create Tender
          </button>
          <button className="button" onClick={() => setCurrentPage('home')}>
            Back to Home
          </button>
        </div>
      );
    }

    if (currentPage === 'vote') {
      return (
        <div className="App">
          <h1>Vote on a Tender</h1>
          <label>
            Tender ID:
            <input type="number" id="vote-tender-id" className="input" />
          </label>
          <button
            className="button"
            onClick={() =>
              handleVote(document.getElementById("vote-tender-id").value)
            }
          >
            Vote
          </button>
          <button className="button" onClick={() => setCurrentPage('home')}>
            Back to Home
          </button>
        </div>
      );
    }

    if (currentPage === 'bids') {
      return (
        <div className="App">
          <h1>Place a Bid</h1>
          <label>
            Tender ID:
            <input type="number" id="bid-tender-id" className="input" />
          </label>
          <label>
            Bid Amount (in ETH):
            <input type="number" id="bid-amount" className="input" />
          </label>
          <button
            className="button"
            onClick={() =>
              handlePlaceBid(
                document.getElementById("bid-tender-id").value,
                document.getElementById("bid-amount").value
              )
            }
          >
            Place Bid
          </button>
          <button className="button" onClick={() => setCurrentPage('home')}>
            Back to Home
          </button>
        </div>
      );
    }

    if (currentPage === 'edit-bid') {
      return (
        <div className="App">
          <h1>Edit Your Bid</h1>
          <label>
            Tender ID:
            <input type="number" id="edit-bid-tender-id" className="input" />
          </label>
          <label>
            New Bid Amount (in ETH):
            <input type="number" id="edit-bid-amount" className="input" />
          </label>
          <button
            className="button"
            onClick={() =>
              handleEditBid(
                document.getElementById("edit-bid-tender-id").value,
                document.getElementById("edit-bid-amount").value
              )
            }
          >
            Update Bid
          </button>
          <button className="button" onClick={() => setCurrentPage('home')}>
            Back to Home
          </button>
        </div>
      );
    }

    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <header className="App-header">
          <p>Welcome to e-Ebay!</p>
        </header>
        {isLoggedIn ? (
          <div className="button-container">
            <button className="button" onClick={() => setCurrentPage('create-tender')}>Create Tender</button>
            <button className="button" onClick={() => setCurrentPage('vote')}>Vote</button>
            <button className="button" onClick={() => setCurrentPage('bids')}>Bids</button>
            <button className="button" onClick={() => setCurrentPage('edit-bid')}>Edit Bids</button>
          </div>
        ) : (
          <div>
            <button className="button" onClick={handleRegister}>Register</button>
            <button className="button" onClick={handleLogin}>Log In</button>
          </div>
        )}


        {/* Display Tenders Table */}
        <h1>Current Tenders</h1>
        <table className="App-table">
          <thead>
            <tr>
              <th>Tender ID</th>
              <th>Name</th>
              <th>Votes</th>
              <th>Time Left</th>
            </tr>
          </thead>
          <tbody>
            {tenders.map((tender, index) => (
              <tr key={index}>
                <td>{tender.id}</td>
                <td>{tender.name}</td>
                <td>{tender.votes}</td>
                <td>{calculateTimeLeft(tender.endTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return renderPage();
}

export default App;
