import Web3 from 'web3';
import abi from '../abi.json';

const CONTRACT_ABI = abi;
const CONTRACT_ADDRESS = "0xdc5899a331817b3c9f122dd745447528968eeb6d";

let isRequestPending = false;

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

export const connectWallet = async () => {
  if (isRequestPending) {
    console.log("Request already pending...");
    return;
  }

  try {
    isRequestPending = true;

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    console.log("Wallet connected:", accounts[0]);
    return accounts[0];
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    return null;
  } finally {
    isRequestPending = false;
  }
};

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

    console.log("Connected to blockchain with account:", accounts[0]);

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