import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './Welsh_Government_logo.svg';
import EditBid from './components/EditBids';
import CreateTender from './components/CreateTender';
import PlaceBid from './components/PlaceBid';
import Vote from './components/Vote';
import handleRegister from './utils/handleRegister';
import handleLogin from './utils/handleLogin';
import handleCreateTender from './utils/handleCreateTender';
import handleEditBid from './utils/handleEditBid';
import handlePlaceBid from './utils/handlePlaceBid';
import handleVote from './utils/handleVote';
import handleRowClick from './utils/handleRowClick';
import calculateOpenStatus from './utils/calculateOpenStatus';
import calculateTimeLeftStr from './utils/calculateTimeLeftStr';
import calculateTimeLeftInt from './utils/calculateTimeLeftInt';
import { initWeb3, connectWallet, getTenders } from './utils/web3Utils';

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

  useEffect(() => { 
    initWeb3(setWeb3, setAccount, setContract, setLoading, setTenders, setBids);
    connectWallet();
  }, []); 

  useEffect(() => {
    if (contract) {
      getTenders(contract, setLoading, setTenders);
    }
  }, [contract]);

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
          </ul>
        ) : (
          <ul className="button-list">
            <li><button className="button" onClick={handleRegister}>Register</button></li>
            <li><button className="button" onClick={() => handleLogin(setIsLoggedIn)}>Log In</button></li>
          </ul>
        )}
      </header>
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
          handleVote={(tenderId) => handleVote(contract, account, tenderId)}
          setCurrentPage={setCurrentPage}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
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
                  <td>{tender.id}</td>
                  <td>{tender.name}</td>
                  <td>{tender.description || 'N/A'}</td>
                  <td>{tender.votes}</td>
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