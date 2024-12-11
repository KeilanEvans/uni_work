import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Papa from 'papaparse'; // For parsing CSV
import { saveAs } from 'file-saver'; // For downloading CSV
import './App.css';
import logo from './eebay.svg';

// Replace with your contract ABI and address
const CONTRACT_ABI = [/* Your ABI Here */];
const CONTRACT_ADDRESS = "0xYourContractAddress"; // Replace with your deployed contract address

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [tenders, setTenders] = useState([]);
  const [extraDetails, setExtraDetails] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [bids, setBids] = useState({});

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3(Web3.givenProvider || "http://localhost:8545");
        const accounts = await web3Instance.eth.requestAccounts();
        const tenderContract = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setContract(tenderContract);
  
        console.log("Connected to blockchain:", accounts[0]);
  
        // Load Tenders
        const tenderCount = await tenderContract.methods.tenderCount().call();
        const loadedTenders = [];
        for (let i = 0; i < tenderCount; i++) {
          const tender = await tenderContract.methods.tenders(i).call();
          loadedTenders.push(tender);
        }
        setTenders(loadedTenders);
  
        // Load Bids for Current User
        const userBids = {};
        for (let i = 0; i < tenderCount; i++) {
          const bid = await tenderContract.methods.bids(i, accounts[0]).call();
          if (bid.exists) {
            userBids[i] = bid;
          }
        }
        setBids(userBids);
  
        // Load Extra Details from CSV
        fetch('./tenders.csv')
          .then(response => response.text())
          .then(csvData => {
            Papa.parse(csvData, {
              header: true,
              complete: (result) => setExtraDetails(result.data),
            });
          });
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
    const now = Math.floor(new Date().getTime() / 1000);
    const timeLeft = endTime - now;
    if (timeLeft > 0) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      return `${minutes}m ${seconds}s`;
    }
    return 'Voting Ended';
  };

  const handleCreateTender = async (name, description, duration) => {
    try {
      // Add to Blockchain
      await contract.methods.createTender(name, duration).send({ from: account });

      // Add to CSV
      const newTender = {
        id: tenders.length,
        name,
        description,
        creator: account,
        endTime: Math.floor(new Date().getTime() / 1000) + duration,
      };
      const updatedDetails = [...extraDetails, newTender];
      setExtraDetails(updatedDetails);

      const updatedCSV = Papa.unparse(updatedDetails);
      const blob = new Blob([updatedCSV], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'tenders.csv');

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
        <div className="create-tender-container">
          <h1 className="page-title">Create a New Tender</h1>
          <form className="tender-form">
            <div className="form-group">
              <label className="form-label">Tender Name:</label>
              <input type="text" id="tender-name" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Description:</label>
              <textarea id="tender-description" className="form-input form-textarea"></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (in seconds):</label>
              <input type="number" id="tender-duration" className="form-input" />
            </div>
            <div className="form-buttons">
              <button
                type="button"
                className="button create-button"
                onClick={() =>
                  handleCreateTender(
                    document.getElementById("tender-name").value,
                    document.getElementById("tender-description").value,
                    parseInt(document.getElementById("tender-duration").value)
                  )
                }
              >
                Create Tender
              </button>
              <button
                type="button"
                className="button back-button"
                onClick={() => setCurrentPage('home')}
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>
      );
    }    

    if (currentPage === 'vote') {
      return (
        <div className="vote-container">
          <h1 className="page-title">Vote on a Tender</h1>
          <form className="vote-form">
            <div className="form-group">
              <label className="form-label">Select Tender:</label>
              <select id="vote-tender-id" className="form-input">
                {tenders.map((tender, index) => (
                  <option key={index} value={tender.id}>
                    {tender.name} - Votes: {tender.votes}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-buttons">
              <button
                type="button"
                className="button vote-button"
                onClick={() => handleVote(document.getElementById("vote-tender-id").value)}
              >
                Submit Vote
              </button>
              <button
                type="button"
                className="button back-button"
                onClick={() => setCurrentPage('home')}
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>
      );
    }
    

    if (currentPage === 'bids') {
      return (
        <div className="bid-container">
          <h1 className="page-title">Place a Bid</h1>
          <form className="bid-form">
            <div className="form-group">
              <label className="form-label">Select Tender:</label>
              <select id="bid-tender-id" className="form-input">
                {tenders
                  .filter((tender) => !tender.isOpen && tender.highestBidder === "0x0000000000000000000000000000000000000000") // Only tenders in the bidding phase
                  .map((tender, index) => (
                    <option key={index} value={tender.id}>
                      {tender.name} - Current Highest Bid: {web3.utils.fromWei(tender.highestBid, "ether")} ETH
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bid Amount (in ETH):</label>
              <input type="number" id="bid-amount" className="form-input" min="0.01" step="0.01" />
            </div>
            <div className="form-buttons">
              <button
                type="button"
                className="button bid-button"
                onClick={() =>
                  handlePlaceBid(
                    document.getElementById("bid-tender-id").value,
                    document.getElementById("bid-amount").value
                  )
                }
              >
                Submit Bid
              </button>
              <button
                type="button"
                className="button back-button"
                onClick={() => setCurrentPage('home')}
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>
      );
    }
    

    if (currentPage === 'edit-bid') {
      return (
        <div className="edit-bid-container">
          <h1 className="page-title">Edit Your Bid</h1>
          <form className="edit-bid-form">
            <div className="form-group">
              <label className="form-label">Select Tender:</label>
              <select id="edit-bid-tender-id" className="form-input">
                {Object.keys(bids).map((tenderId) => (
                  <option key={tenderId} value={tenderId}>
                    {tenders[tenderId]?.name || `Tender ${tenderId}`} - Your Bid: {web3.utils.fromWei(bids[tenderId].amount, "ether")} ETH
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">New Bid Amount (in ETH):</label>
              <input type="number" id="edit-bid-amount" className="form-input" min="0.01" step="0.01" />
            </div>
            <div className="form-buttons">
              <button
                type="button"
                className="button edit-bid-button"
                onClick={() =>
                  handleEditBid(
                    document.getElementById("edit-bid-tender-id").value,
                    document.getElementById("edit-bid-amount").value
                  )
                }
              >
                Submit New Bid
              </button>
              <button
                type="button"
                className="button back-button"
                onClick={() => setCurrentPage('home')}
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>
      );
    }
    
    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <header className="App-header">
          <p>Welcome to e-Ebay!</p>
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
        </header>
        <h1>Current Tenders</h1>
        <table className="App-table">
          <thead>
            <tr>
              <th>Tender ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Votes</th>
              <th>Time Left</th>
            </tr>
          </thead>
          <tbody>
            {tenders.map((tender, index) => {
              const details = extraDetails.find((d) => d.id == tender.id) || {};
              return (
                <tr key={index}>
                  <td>{tender.id}</td>
                  <td>{tender.name}</td>
                  <td>{details.description || 'N/A'}</td>
                  <td>{tender.votes}</td>
                  <td>{calculateTimeLeft(tender.endTime)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return renderPage();
}

export default App;
