import Web3 from 'web3';
import abi from '../abi.json';
import axios from 'axios';

// Web3 contract details
const CONTRACT_ABI = abi;
const CONTRACT_ADDRESS = "0xF98A5076fB382Fc73d25dcd9Ed248dC7c2A1cF9C";

// State variables
let isRequestPending = false;
let currentAccount = null;
let contract = null;

// Getter for currentAccount
export const getCurrentAccount = () => currentAccount;

// Function to convert from Wei to ETH
export const fromWei = (value) => {
  return Web3.utils.fromWei(value, 'ether');
}

// Function to get GBP equivalent of ETH at current exchange rate
export const getEthToGbpRate = async () => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=gbp'
    );
    return response.data.ethereum.gbp; // Extract the ETH price in GBP
  } catch (error) {
    console.error("Error fetching ETH/GBP rate:", error);
    return null;
  }
};

// Setter for currentAccount
const setCurrentAccount = (account) => {
  currentAccount = account;
}

const setInternalContract = (tenderCon) => {
  contract = tenderCon;
}

export const getBids = async (contract, account) => {
  try {
    const [tenderIds, bidAmounts] = await contract.methods.getBids(account).call();
    return { tenderIds, bidAmounts };
  } catch (error) {
    console.error("Error fetching bids:", error);
    throw error;
  }
}

export const registerUserOnBlockchain = async (address, permission) => {
  try {
    if (!contract || !currentAccount) {
      console.log("Displaying currentAccount:", currentAccount);
      console.log("Displaying contract:", contract);
      throw new Error("Wallet not connected or contract not initialised.");
    }

    console.log("Registering user on blockchain...");
    await contract.methods.registerUser(address, permission).send({ from: currentAccount });
    console.log("User registered on blockchain successfully!");
  } catch (error) {
    console.error("Error registering user on blockchain:", error);
    throw error;
  }
}

export const getTenders = async (contract, setLoading, setTenders) => {
  if (!contract) {
    console.error("Contract not initialized!");
    return [];
  }

  try {
    setLoading(true);
    const tenders = await contract.methods.getTenders().call();
    setTenders(tenders);
    return tenders;
  } catch (error) {
    console.error("Error fetching tenders:", error);
    return [];
  } finally {
    setLoading(false);
  }
};

export const getBidAmount = async (tenderId, account) => {
  try {
    const amount = await contract.methods.getBidAmount(tenderId, account).call();
    return amount;
  } catch (error) {
    console.error(`Error fetching bid amount for tenderId ${tenderId}:`, error);
    throw error;
  }
}

export const connectWallet = async () => {
  // Prevent multiple wallet connection requests
  if (isRequestPending) {
    console.log("Request already pending...");
    return currentAccount;
  }

  try {
    // Set request pending incase of future requests during unfilled promises
    isRequestPending = true;

    // Check if MetaMask is available
    if (!window.ethereum) {
      console.error("MetaMask is not installed. Please install it to use this feature.");
      return null;
    }

    // Request account access from MetaMask
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Assign default current account and handle basic errors
    if (accounts.length > 0) {
      currentAccount = accounts[0];
      console.log("Wallet connected:", currentAccount);
    } else {
      console.warn("No accounts returned by MetaMask.");
      currentAccount = null;
    }

    return getCurrentAccount();

  } catch (error) {
    console.error("Failed to connect wallet:", error.message || error);
    return null;

  } finally {
    isRequestPending = false;
  }
};

// Event listener for changing metamask accounts
window.ethereum?.on("accountsChanged", (accounts) => {
  if (accounts.length > 0) {
    setCurrentAccount(accounts[0]);
    console.log("Account switched:", currentAccount);

  } else {
    console.warn("MetaMask disconnected. No accounts available.");
    setCurrentAccount(null);
  }
});

export const initWeb3 = async (setWeb3, setAccount, setContract, setLoading, setTenders, setBids) => {
  try {
    let provider;

    if (window.ethereum) {
      provider = window.ethereum;
      await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request access to MetaMask
      console.log("Using MetaMask provider.");
    } else if (Web3.givenProvider) {
      provider = Web3.givenProvider;
      console.log("Using Web3 provider.");
    } else {
      // Fallback to local node
      provider = "http://localhost:8545";
      console.warn("No provider found. Falling back to localhost:8545");
    }

    const web3Instance = new Web3(provider);
    const accounts = await web3Instance.eth.requestAccounts();
    const tenderContract = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    console.log(tenderContract);

    setWeb3(web3Instance);
    setAccount(accounts[0]);
    setContract(tenderContract);
    setInternalContract(tenderContract);

    setCurrentAccount(accounts[0])
    console.log("Connected to blockchain with account:", getCurrentAccount());

    if (!tenderContract) {
      throw new Error("Issue: Contract not initialised properly!");
    }

    // Load Tenders
    await getTenders(tenderContract, setLoading, setTenders);

    // Load Bids for Current User
    const userBids = await tenderContract.methods.getBids(accounts[0]).call();
    setBids(userBids);

  } catch (error) {
    console.error("Error connecting to Web3:", error);
  }
};