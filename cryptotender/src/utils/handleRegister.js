import axios from 'axios';
import { getCurrentAccount, connectWallet, registerUserOnBlockchain } from './web3Utils';


const handleRegister = async (username, password, address, setIsLoggedIn) => {
  try {
    let account = getCurrentAccount();

    if (!account) {
      console.log("Wallet not connected. Connecting...");
      account = await connectWallet();
    }

    if (!account) {
      alert("Please connect your MetaMask wallet to proceed.");
      return;
    }

    const response = await axios.post('/api/auth/register', {
      username,
      password,
      address,
    });

    if (response.status === 201) {
      setIsLoggedIn(true);
      console.log("Registering user on the blockchain...");
      await registerUserOnBlockchain(address);

      console.log("User registered on the blockchain!");
      
    } else {
      console.error("Unexpected response status:", response.status);
      alert("Failed to register user. Please try again.");
    }
    

  } catch (error) {
    console.error("Registration error:", error); // Debugging statement
    alert(error.response?.data?.message || "Registration failed");
  }
};

export default handleRegister;