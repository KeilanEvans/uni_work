import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Papa from 'papaparse'; // For parsing CSV
import { saveAs } from 'file-saver'; // For downloading CSV
import './App.css';
import logo from './Welsh_Government_logo.svg';
import abi from './abi.json';

const CONTRACT_ABI = abi;//TenderContractABI;
const CONTRACT_ADDRESS = "0x51fB4A37129a60C78b2976ccFee7aB83aC51eb40";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clickedRow, setClickedRow] = useState(null);
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
        const loadedTenders = await tenderContract.methods.getTenders().call();
        setTenders(loadedTenders);
  
        // Load Bids for Current User
        const userBids = await tenderContract.methods.getBids(accounts[0]).call();
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
  
  // Method to handle pre-registered user login
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

  // Method to handle new user registration
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

  // Method to calculate countdown timer value from a Tender's end date/time unix value
  const calculateTimeLeftStr = (endTime) => {
    const now = Math.floor(new Date().getTime() / 1000);
    const timeLeft = endTime - now;
    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / 3600)
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = timeLeft % 60;

      return `${
      hours
      .toString()
      .padStart(2, '0')}:${
      minutes
      .toString()
      .padStart(2, '0')}:${
      seconds
      .toString()
      .padStart(2, '0')}`;
    }
    return 'Voting Ended';
  };

  const calculateTimeLeftInt = (endTime) => {
    const now = Math.floor(new Date().getTime() / 1000);
    const timeLeft = endTime - now;
    return timeLeft;
  }

  // Method to handle users creating Tenders
  const handleCreateTender = async (title, description, endDate, endTime) => {
    try {
      // Create start time for tender.
      const startTimeUnix = Math.floor(new Date().getTime() / 1000);

      // Create end time for tender from parsed parameters.
      const endDateTimeString = `${endDate}T${endTime}:00`;
      const endTimeUnix = Math.floor(new Date(endDateTimeString).getTime() / 1000);

      // Add to Blockchain
      await contract.methods
        .createTender(title, startTimeUnix, endTimeUnix, description)
        .send({ from: account });

      // Add to CSV
      const newTender = {
        id: tenders.length,
        title,
        creator: account,
        startTime: startTimeUnix,
        endTime: endTimeUnix,
        description,
        highestBid: 0,
        highestBidder: "0x0000000000000000000000000000000000000000",
        isOpen: true,
        votes: 0,
      };

      const updatedDetails = [...extraDetails, newTender];
      setExtraDetails(updatedDetails);
      
      // Now we need to sync our understanding of the tenders on the blockchain
      await contract.methods.getTenders().call().then((loadedTenders) => {
        setTenders(loadedTenders);
      });
      
      const updatedCSV = Papa.unparse(updatedDetails);
      const blob = new Blob([updatedCSV], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'tenders.csv');

      alert("Tender Created Successfully");
    } catch (error) {
      console.error("Error creating tender:", error);
    }
  };

  // Method for handling users voting
  const handleVote = async (tenderId) => {
    try {
      await contract.methods.vote(tenderId).send({ from: account });
      alert("Vote Submitted Successfully");
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Method for handling users placing bids
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
  
  // Method to handle users editing their bids
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

  // Method to handle which row is clicked for highlighting purposes
  const handleRowClick = (id) => {

    // If the clicked row is an already selected row, deselect it. (setClickedRow(null) deselects.)
    if (id === clickedRow) {
      setClickedRow(null);
    } else {
      setClickedRow(id);
    }
  };

  // Method to assert if a tender is still open or closed
  const calculateOpenStatus = (endTime) => {
    const now = Math.floor(new Date().getTime() / 1000);
    const timeLeft = endTime - now;
    if (timeLeft > 0) {
      return 'Open'
    }
    return 'Closed';
    
  }

  // Method to control the page displayed to the user
  const renderPage = () => {
    if (currentPage === 'create-tender') {
      return (
        <div className="create-tender-container">
          <h1 className="page-title">Create a New Tender</h1>
          <form className="tender-form">
            <div className="form-group">
              <label className="form-label">Tender Name:</label>
              <input 
                type="text" 
                id="tender-name" 
                className="form-input"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description:</label>
              <textarea id="tender-description" className="form-input form-textarea"></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Close Date:</label>
              <input 
                type="date" 
                id="tender-date" 
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Close Time:</label>
              <input 
                type="time" 
                id="tender-time" 
                className="form-input"
                required
              />
            </div>
            <div className="form-buttons">
              <button
                type="button"
                className="button create-button"
                onClick={() => {
                  const name = document.getElementById("tender-name").value;
                  const description = document.getElementById("tender-description").value;
                  const date = document.getElementById("tender-date").value;
                  const time = document.getElementById("tender-time").value;

                  if (!name || !description || !date || !time) {
                    alert("All fields are required.");
                    return;
                  }

                  handleCreateTender(name, description, date, time);
                  setCurrentPage('home');
                  setIsLoggedIn(true);
                }}
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
                onClick={() => {
                  const vote = document.getElementById("vote-tender-id").value;

                  if (!vote) {
                    alert("Please select a tender to vote on!")
                  }

                  handleVote();
                  setCurrentPage('home')
                  setIsLoggedIn(true)
                }}
              >
                Submit Vote
              </button>
              <button
                type="button"
                className="button back-button"
                onClick={() => {
                  setCurrentPage('home');
                  setIsLoggedIn(true);
                }}
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
                onClick={() => {
                  const tenderID = document.getElementById("bid-tender-id").value;
                  const bidValue = document.getElementById("bid-amount").value

                  if (!tenderID || !bidValue) {
                    alert("All fields are required.");
                    return;
                  }

                  handlePlaceBid(tenderID, bidValue);
                  setCurrentPage('home');
                  setIsLoggedIn(true);
                }}
              >
                Submit Bid
              </button>
              <button
                type="button"
                className="button back-button"
                onClick={() => {
                  setCurrentPage('home');
                  setIsLoggedIn(true);
                }}
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
                onClick={() => {
                  const tenderID = document.getElementById("edit-bid-tender-id").value;
                  const bidValue = document.getElementById("edit-bid-amount").value

                  if (!tenderID || !bidValue) {
                    alert("All fields are required.");
                    return;
                  }

                  handleEditBid(tenderID, bidValue);
                  setCurrentPage('home');
                  setIsLoggedIn(true);
                }}
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

      // Main Page HTML 

      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <header className="App-header">
          <p>Welcome to the Welsh Government Community Voting innitative !</p>
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
              <th>Open Status</th>
              <th>Time Left</th>
            </tr>
          </thead>
          <tbody>
            {tenders.map((tender, index) => {
              const details = extraDetails.find((d) => d.id == tender.id) || {};
              return (
                <tr 
                  key={index}
                  className={clickedRow === tender.id ? 'Clicked-row' : ''}
                  onClick={() => handleRowClick(tender.id)}
                >
                  <td>{tender.id}</td>
                  <td>{tender.name}</td>
                  <td>{details.description || 'N/A'}</td>
                  <td>{tender.votes}</td>
                  <td>{calculateOpenStatus(tender.endTime)}</td>
                  <td
                    className={
                      calculateTimeLeftInt(tender.endTime) < 3600
                      ? 'Closing-bidding'
                      : 'Open-bidding'
                    }
                  >{calculateTimeLeftStr(tender.endTime)}</td>
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
