import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Papa from 'papaparse'; // For parsing CSV
import { saveAs } from 'file-saver'; // For downloading CSV
import './App.css';
import logo from './eebay.svg';

// Replace with your contract ABI and address
const CONTRACT_ABI = [{
  "inputs": [],
  "stateMutability": "nonpayable",
  "type": "constructor"
},
{
  "inputs": [
      {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
      },
      {
          "internalType": "address",
          "name": "",
          "type": "address"
      }
  ],
  "name": "bids",
  "outputs": [
      {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
      },
      {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
      }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
      {
          "internalType": "uint256",
          "name": "tenderId",
          "type": "uint256"
      }
  ],
  "name": "closeTender",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
      {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
      },
      {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
      }
  ],
  "name": "createTender",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
      {
          "internalType": "uint256",
          "name": "tenderId",
          "type": "uint256"
      }
  ],
  "name": "getTender",
  "outputs": [
      {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
      },
      {
          "internalType": "address",
          "name": "creator",
          "type": "address"
      },
      {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
      },
      {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
      },
      {
          "internalType": "uint256",
          "name": "highestBid",
          "type": "uint256"
      },
      {
          "internalType": "address",
          "name": "highestBidder",
          "type": "address"
      },
      {
          "internalType": "bool",
          "name": "isOpen",
          "type": "bool"
      },
      {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
      }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "owner",
  "outputs": [
      {
          "internalType": "address",
          "name": "",
          "type": "address"
      }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
      {
          "internalType": "uint256",
          "name": "tenderId",
          "type": "uint256"
      }
  ],
  "name": "placeBid",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
},
{
  "inputs": [
      {
          "internalType": "address",
          "name": "user",
          "type": "address"
      }
  ],
  "name": "registerUser",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
      {
          "internalType": "uint256",
          "name": "tenderId",
          "type": "uint256"
      }
  ],
  "name": "reviseBid",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
},
{
  "inputs": [
      {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
      }
  ],
  "name": "tenders",
  "outputs": [
      {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
      },
      {
          "internalType": "address",
          "name": "creator",
          "type": "address"
      },
      {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
      },
      {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
      },
      {
          "internalType": "uint256",
          "name": "highestBid",
          "type": "uint256"
      },
      {
          "internalType": "address",
          "name": "highestBidder",
          "type": "address"
      },
      {
          "internalType": "bool",
          "name": "isOpen",
          "type": "bool"
      },
      {
          "internalType": "uint256",
          "name": "votes",
          "type": "uint256"
      }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
      {
          "internalType": "address",
          "name": "",
          "type": "address"
      }
  ],
  "name": "userRegistry",
  "outputs": [
      {
          "internalType": "bool",
          "name": "",
          "type": "bool"
      }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
      {
          "internalType": "uint256",
          "name": "tenderId",
          "type": "uint256"
      }
  ],
  "name": "vote",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
      {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
      },
      {
          "internalType": "address",
          "name": "",
          "type": "address"
      }
  ],
  "name": "votes",
  "outputs": [
      {
          "internalType": "bool",
          "name": "",
          "type": "bool"
      }
  ],
  "stateMutability": "view",
  "type": "function"
}
]; // compiled contract ABI here
const CONTRACT_ADDRESS = "608080604052346026575f80546001600160a01b03191633179055610afc908161002b8239f35b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c8062cda3da146108685780630121b93f146107715780630585c25e146107555780632199d5cd146106b55780633f1ffcec14610663578063465e1def146105c85780636a42d8f9146104745780637fe0dd32146104375780638da5cb5b146104105780639979ef451461028d578063bd61a908146100e95763d23254b41461009c575f80fd5b346100e55760403660031901126100e5576100b56109b0565b6004355f52600460205260405f209060018060a01b03165f52602052602060ff60405f2054166040519015158152f35b5f80fd5b346100e55760403660031901126100e557600435602435335f52600160205261011860ff60405f2054166109f6565b808210156102365760025460405191610100830183811067ffffffffffffffff8211176102225760405281835260208301933385526040840190815260608401918252608084015f815260a08501925f845260c08601926001845260e08701955f8752680100000000000000008110156102225780600161019c92016002556109c6565b98909861020f579651885595516001880180546001600160a01b0319166001600160a01b0392831617905595516002880155516003870155516004860155905160058501805492516001600160a81b0319909316919094161790151560a01b60ff60a01b16179091555160069190910155005b634e487b7160e01b5f525f60045260245ffd5b634e487b7160e01b5f52604160045260245ffd5b60405162461bcd60e51b815260206004820152602960248201527f53746172742074696d65206d757374206265206561726c696572207468616e2060448201526832b732103a34b6b29760b91b6064820152608490fd5b60203660031901126100e5576004356102b860ff60056102ac846109c6565b50015460a01c16610a42565b6102c1816109c6565b5090600282015442106103cb576102de6003830154421115610a82565b5f81815260036020908152604080832033845290915290206001015460ff1661038657604051604081019080821067ffffffffffffffff8311176102225760019160405234815260208101928284525f52600360205260405f20828060a01b0333165f5260205260405f2090518155019051151560ff8019835416911617905560048101908154341161036d57005b3490915560050180546001600160a01b03191633179055005b60405162461bcd60e51b815260206004820152601e60248201527f596f75206861766520616c726561647920706c616365642061206269642e00006044820152606490fd5b60405162461bcd60e51b815260206004820152601b60248201527f42696464696e67206861736e27742073746172746564207965742e00000000006044820152606490fd5b346100e5575f3660031901126100e5575f546040516001600160a01b039091168152602090f35b346100e55760203660031901126100e5576001600160a01b0361045861099a565b165f526001602052602060ff60405f2054166040519015158152f35b60203660031901126100e55760043561049360ff60056102ac846109c6565b61049c816109c6565b5090805f52600360205260405f2060018060a01b0333165f5260205260ff600160405f200154161561058e576104d86003830154421115610a82565b5f90815260036020908152604080832033845290915290208054348114610534575f8080809381811561052b575b3390f1156105205734905560048101908154341161036d57005b6040513d5f823e3d90fd5b506108fc610506565b60405162461bcd60e51b815260206004820152602c60248201527f4e657720626964206d75737420626520646966666572656e742066726f6d206560448201526b3c34b9ba34b7339037b7329760a11b6064820152608490fd5b60405162461bcd60e51b81526020600482015260126024820152712737903134b210383630b1b2b2103cb2ba1760711b6044820152606490fd5b346100e55760203660031901126100e5576004356002548110156100e5576105ef906109c6565b50805460018201546002830154600384015460048501546005860154600690960154604080519687526001600160a01b0395861660208801528601939093526060850191909152608084015290831660a0808401919091529290921c60ff16151560c082015260e081019190915261010090f35b346100e55760403660031901126100e55761067c6109b0565b6004355f52600360205260405f209060018060a01b03165f526020526040805f2060ff6001825492015416825191825215156020820152f35b346100e55760203660031901126100e5576106ce61099a565b5f546001600160a01b03163303610705576001600160a01b03165f908152600160208190526040909120805460ff19169091179055005b60405162461bcd60e51b815260206004820152602260248201527f4f6e6c7920746865206f776e65722063616e2072656769737465722075736572604482015261399760f11b6064820152608490fd5b346100e55760203660031901126100e5576105ef6004356109c6565b346100e55760203660031901126100e557600435335f52600160205261079d60ff60405f2054166109f6565b6107ad60ff60056102ac846109c6565b5f81815260046020908152604080832033845290915290205460ff16610823575f8181526004602090815260408083203384529091529020805460ff191660011790556006906107fc906109c6565b500180545f19811461080f576001019055005b634e487b7160e01b5f52601160045260245ffd5b60405162461bcd60e51b815260206004820152601760248201527f596f75206861766520616c726561647920766f7465642e0000000000000000006044820152606490fd5b346100e55760203660031901126100e557600435610885816109c6565b50600101546001600160a01b031633036109455760036108a4826109c6565b5001544210610908576108b6906109c6565b5060058101805460ff60a01b1981169091556001600160a01b03166108d757005b5f80808093600460018060a01b03600183015416910154908282156108ff575bf11561052057005b506108fc6108f7565b60405162461bcd60e51b81526020600482015260156024820152742a32b73232b91034b99039ba34b6361037b832b71760591b6044820152606490fd5b60405162461bcd60e51b815260206004820152602760248201527f596f7520617265206e6f74207468652063726561746f72206f662074686973206044820152663a32b73232b91760c91b6064820152608490fd5b600435906001600160a01b03821682036100e557565b602435906001600160a01b03821682036100e557565b6002548110156109e25760025f52600760205f20910201905f90565b634e487b7160e01b5f52603260045260245ffd5b156109fd57565b60405162461bcd60e51b815260206004820152601e60248201527f596f7520617265206e6f742061207265676973746572656420757365722e00006044820152606490fd5b15610a4957565b60405162461bcd60e51b81526020600482015260116024820152702a32b73232b91034b99031b637b9b2b21760791b6044820152606490fd5b15610a8957565b60405162461bcd60e51b81526020600482015260156024820152742134b23234b733903a34b6b29034b99037bb32b91760591b6044820152606490fdfea2646970667358221220fac7ae3150f9e3b5fce5177bea10642be797106c8b4f0b4708188c3ec9dbf89464736f6c634300081c0033"; // deployed contract address here

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
