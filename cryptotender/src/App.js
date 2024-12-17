import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './Welsh_Government_logo.svg';
import EditBid from './components/EditBids';
import CreateTender from './components/CreateTender';
import PlaceBid from './components/PlaceBid';
import Vote from './components/Vote';
import Register from './components/Register';
import Login from './components/Login';
import handleCreateTender from './utils/handleCreateTender';
import handleEditBid from './utils/handleEditBid';
import handlePlaceBid from './utils/handlePlaceBid';
import handleVote from './utils/handleVote';
import handleRowClick from './utils/handleRowClick';
import calculateOpenStatus from './utils/calculateOpenStatus';
import calculateTimeLeftStr from './utils/calculateTimeLeftStr';
import calculateTimeLeftInt from './utils/calculateTimeLeftInt';
import handleLogout from './utils/handleLogout.js';
import { 
  initWeb3, 
  connectWallet, 
  getTenders,
  getCurrentAccount
 } from './utils/web3Utils';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clickedRow, setClickedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [tenders, setTenders] = useState([]);
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [bids, setBids] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(null); // null, 'register', or 'login'
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Hook to initialise web3 connection and connect to MetaMask Wallet
  useEffect(() => { 
    initWeb3(setWeb3, setAccount, setContract, setLoading, setTenders, setBids);
    connectWallet();
  }, []); 

  // Hook to get the tenders for the table to render
  useEffect(() => {
    if (contract) {
      getTenders(contract, setLoading, setTenders);
    }
  }, [contract]);

  // Hook to handle the countdown of the timers without getting data from blockchain
  //    Leads to asynchronous state between front and back-end but for this purposes it is fine
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onVote = async (contract, account, tenderId) => {
    try {
      await handleVote(contract, account, tenderId);
      await getTenders(contract, setLoading, setTenders);
    } catch (error) {
      console.error("Error voting:", error.message || error.toString());
    }
  }

  const handleFormClose = () => {
    setShowForm(null);
  };

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <header className="App-header">
        <p>Welcome to the Welsh Government Community Voting initiative!</p>
        {isLoggedIn ? (
          <ul className="button-list">
            <li><button className="button" onClick={() => setCurrentPage('create-tender')}>Create Tender</button></li>
            <li><button className="button" onClick={() => setCurrentPage('vote')}>Vote</button></li>
            <li><button className="button" onClick={() => setCurrentPage('bids')}>Bids</button></li>
            <li><button className="button" onClick={() => setCurrentPage('edit-bid')}>Edit Bids</button></li>
            <li><button className="button" onClick={() => { handleLogout(setIsLoggedIn); handleFormClose(); }}>Log Out</button></li>
          </ul>
        ) : (
          <ul className="button-list">
            <li><button className="button" onClick={() => setShowForm('register')}>Register</button></li>
            <li><button className="button" onClick={() => setShowForm('login')}>Log In</button></li>
          </ul>
        )}
      </header>
      {showForm === 'register' && !isLoggedIn && (
        <Register setIsLoggedIn={(value) => { setIsLoggedIn(value); handleFormClose(); }} />
      )}
      {showForm === 'login' && !isLoggedIn && (
        <Login setIsLoggedIn={(value) => { setIsLoggedIn(value); handleFormClose(); }} />
      )}
      {currentPage === 'edit-bid' && (
        <EditBid
          bids={bids}
          tenders={tenders}
          handleEditBid={(tenderId, newBidAmount) => handleEditBid(contract, account, web3, tenderId, newBidAmount)}
          setCurrentPage={setCurrentPage}
          setIsLoggedIn={setIsLoggedIn}
          web3={web3}
        />
      )}
      {currentPage === 'create-tender' && (
        <CreateTender
          handleCreateTender={(title, description, endDate, endTime) => handleCreateTender(contract, account, setTenders, title, description, endDate, endTime)}
          setCurrentPage={setCurrentPage}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
      {currentPage === 'bids' && (
        <PlaceBid
          tenders={tenders}
          web3={web3}
          handlePlaceBid={(tenderId, bidAmount) => handlePlaceBid(contract, account, web3, tenderId, bidAmount)}
          setCurrentPage={setCurrentPage}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
      {currentPage === 'vote' && (
        <Vote
          tenders={tenders}
          handleVote={(tenderId) => onVote(contract, account, tenderId)}
          setCurrentPage={setCurrentPage}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
      <h1 className='App-table-title'>Current Tenders</h1>
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
          {loading ? (
            <tr>
              <td colSpan="6">Loading...</td>
            </tr>
          ) : tenders.length > 0 ? (
            tenders.map((tender, index) => {
              return (
                <tr
                  key={index}
                  className={clickedRow === tender.id ? 'Clicked-row' : ''}
                  onClick={() => handleRowClick(tender.id, clickedRow, setClickedRow)}
                >
                  <td>{tender.id.toString()}</td>
                  <td>{tender.title}</td>
                  <td>{tender.description || 'N/A'}</td>
                  <td>{tender.votes.toString()}</td>
                  <td>{calculateOpenStatus(tender.endTime)}</td>
                  <td
                    className={
                      calculateTimeLeftInt(tender.endTime) < 3600
                        ? 'Closing-bidding'
                        : 'Open-bidding'
                    }
                  >
                    {calculateTimeLeftStr(tender.endTime)}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6">No tenders available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default App;