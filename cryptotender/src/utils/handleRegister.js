import axios from 'axios';
import { getCurrentAccount, connectWallet, registerUserOnBlockchain } from './web3Utils';

const handleRegister = async (username, password, address, permission, setIsLoggedIn) => {
  try {
    let account = getCurrentAccount();

    if (!account) {
      console.log("Wallet not connected. Connecting...");
      account = await connectWallet();
    }

    if (!account) {
      alert("Please connect your MetaMask wallet to proceed.");
      throw new Error("MetaMask wallet not connected");
    }

    console.log("Registering user on the blockchain...");
    await registerUserOnBlockchain(address, permission);

    const response = await axios.post('/api/auth/register', {
      username,
      password,
      address,
      permission,
    });

    if (response.status === 201) {
      setIsLoggedIn(true);
    } else {
      console.error("Unexpected response status:", response.status);
      throw new Error("Failed to register user");
    }
    
  } catch (error) {
    console.error("Registration error:", error); // Debugging statement
    throw error;
  }
};

export default handleRegister;