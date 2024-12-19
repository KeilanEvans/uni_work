import React, { useState, useEffect } from 'react';
import { ErrorProvider } from './context/ErrorContext';
import { SuccessProvider } from './context/SuccessContext';
import ErrorPopup from './components/ErrorPopup';
import SuccessPopup from './components/SuccessPopup';
import './App.css';
import logo from './Welsh_Government_logo.svg';
import EditBid from './components/EditBids';
import CreateTender from './components/CreateTender';
import PlaceBid from './components/PlaceBid';
import Vote from './components/Vote';
import Register from './components/Register';
import Login from './components/Login';
import handleVote from './utils/handleVote';
import calculateOpenStatus from './utils/calculateOpenStatus';
import calculateTimeLeftStr from './utils/calculateTimeLeftStr';
import calculateTimeLeftInt from './utils/calculateTimeLeftInt';
import handleLogout from './utils/handleLogout.js';
import { 
  initWeb3, 
  connectWallet, 
  getTenders,
  getCurrentAccount,
  fromWei,
  getEthToGbpRate,
  getBids
 } from './utils/web3Utils';

function App() {
  // State variables
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [tenders, setTenders] = useState([]);
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [bids, setBids] = useState({});
  const [loading, setLoading] = useState({ tenderIds: [], bidAmounts: [] });
  const [showForm, setShowForm] = useState(null); // null, 'register', or 'login'
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [ethGbpRate, setEthGbpRate] = useState(null);

  // Fetch ETH to GBP rate when component mounts
  useEffect(() => {
    const fetchRate = async () => {
      const rate = await getEthToGbpRate();
      setEthGbpRate(rate);
    };
    fetchRate();
  }, []);

  // Initialize web3 when component mounts
  useEffect(() => {
    const initializeWeb3 = async () => {
      await initWeb3(setWeb3, setAccount, setContract, setLoading, setTenders, setBids);
    };
    initializeWeb3();
  }, []);

  // Fetch bids when contract and account are available
  useEffect(() => {
    const fetchData = async () => {
      if (contract && account) {
        const fetchedBids = await getBids(contract, account);
        setBids(fetchedBids);
      }
    };
    fetchData();
  }, [currentPage, contract, account])

  // Check for token in local storage and initialize web3
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    initWeb3(setWeb3, setAccount, setContract, setLoading, setTenders, setBids);
    connectWallet();
  }, []);

  // Fetch tenders when contract is available
  useEffect(() => {
    if (contract) {
      getTenders(contract, setLoading, setTenders);
    }
  }, [contract]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // Handle vote submission
  const onVote = async (contract, account, tenderId) => {
    try {
      await handleVote(contract, account, tenderId);
      await getTenders(contract, setLoading, setTenders);
    } catch (error) {
      // Handle error
    }
  };

  // Convert ETH value to GBP
  const convertToGbp = (ethValue) => {
    return ethGbpRate ? (parseFloat(ethValue) * ethGbpRate).toFixed(2) : "Loading...";
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(null);
  };

  // Format currency value
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Handle logout click
  const handleLogoutClick = () => {
    handleLogout(setIsLoggedIn);
    localStorage.removeItem('token');
    handleFormClose();
  };

  return (
    <ErrorProvider>
      <SuccessProvider>
        <div className="App">
          <ErrorPopup />
          <SuccessPopup />
          <img src={logo} className="App-logo" alt="logo" />
          <header className="App-header">
            <p>Welcome to the Welsh Government Community Voting initiative!</p>
            {isLoggedIn ? (
              <ul className="button-list">
                <li><button className="button" onClick={() => setCurrentPage('create-tender')}>Create Tender</button></li>
                <li><button className="button" onClick={() => setCurrentPage('vote')}>Vote</button></li>
                <li><button className="button" onClick={() => setCurrentPage('bids')}>Bids</button></li>
                <li><button className="button" onClick={() => setCurrentPage('edit-bid')}>Edit Bids</button></li>
                <li><button className="button" onClick={handleLogoutClick}>Log Out</button></li>
              </ul>
            ) : (
              <ul className="button-list">
                <li><button className="button" onClick={() => setShowForm('register')}>Register</button></li>
                <li><button className="button" onClick={() => setShowForm('login')}>Log In</button></li>
              </ul>
            )}
          </header>
          {showForm === 'register' && !isLoggedIn && (
            <Register setIsLoggedIn={(value) => { setIsLoggedIn(value); handleFormClose(); }} setCurrentPage={setCurrentPage} />
          )}
          {showForm === 'login' && !isLoggedIn && (
            <Login setIsLoggedIn={(value) => { setIsLoggedIn(value); handleFormClose(); }} setCurrentPage={setCurrentPage} />
          )}
          {currentPage === 'edit-bid' && (
            <EditBid
              bids={bids}
              tenders={tenders}
              contract={contract} // Pass the contract prop
              account={account}
              setTenders={setTenders}
              setCurrentPage={setCurrentPage}
              setIsLoggedIn={setIsLoggedIn}
              web3={web3}
            />
          )}
          {currentPage === 'create-tender' && (
            <CreateTender
              contract={contract}
              account={account}
              setTenders={setTenders}
              setCurrentPage={setCurrentPage}
              setIsLoggedIn={setIsLoggedIn}
            />
          )}
          {currentPage === 'bids' && (
            <PlaceBid
              tenders={tenders}
              web3={web3}
              contract={contract}
              account={account}
              setCurrentPage={setCurrentPage}
              setIsLoggedIn={setIsLoggedIn}
            />
          )}
          {currentPage === 'vote' && (
            <Vote
              tenders={tenders}
              contract={contract}
              account={account}
              setCurrentPage={setCurrentPage}
              setIsLoggedIn={setIsLoggedIn}
            />
          )}
          <h1 className="current-tenders-title">Current Tenders</h1>
          <table className="App-table">
            <thead>
              <tr>
                <th>Tender ID</th>
                <th>Name</th>
                <th>Bounty (ETH)</th>
                <th>Bounty (£ GBP)</th>
                <th>Description</th>
                <th>Votes</th>
                <th>Highest Bid (ETH)</th>
                <th>Highest Bid (£ GBP)</th>
                <th>Open Status</th>
                <th>Time Left</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10">Loading...</td>
                </tr>
              ) : tenders.length > 0 ? (
                tenders.map((tender, index) => {
                  const ethBounty = fromWei(tender.bounty.toString());
                  const gbpBounty = convertToGbp(ethBounty);
                  const ethValue = fromWei(tender.highestBid.toString());
                  const gbpValue = convertToGbp(ethValue);
                  const openStatus = calculateOpenStatus(tender.endTime);
                  const timeLeft = calculateTimeLeftStr(tender.endTime);
                  const timeLeftInt = calculateTimeLeftInt(tender.endTime);
                  
                  return (
                    <tr key={tender.id.toString()}>
                      <td>{tender.id.toString()}</td>
                      <td>{tender.title}</td>
                      <td>{ethBounty}</td>
                      <td>{formatCurrency(gbpBounty)}</td>
                      <td>{tender.description || 'N/A'}</td>
                      <td>{tender.votes.toString()}</td>
                      <td>{ethValue} ETH</td>
                      <td>{formatCurrency(gbpValue)}</td>
                      <td className={openStatus === 'Open' ? 'open-status' : 'closed-status'}>
                      {openStatus}
                      </td>
                      <td
                        className={
                          timeLeftInt < 3600
                            ? 'Closing-bidding'
                            : 'Open-bidding'
                        }
                      >
                        {timeLeft}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8">No tenders available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SuccessProvider>
    </ErrorProvider>
  );
}

export default App;