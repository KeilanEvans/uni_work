import axios from 'axios';
import { getCurrentAccount, connectWallet, registerUserOnBlockchain } from './web3Utils';

// Function to handle user registration
const handleRegister = async (username, password, address, permission, setIsLoggedIn, showError, showSuccess) => {
  try {
    // Get the current account from MetaMask
    let account = getCurrentAccount();

    // If no account is found, attempt to connect the wallet
    if (!account) {
      account = await connectWallet();
    }

    // If still no account is found, show an error and throw an error
    if (!account) {
      showError("Please connect your MetaMask wallet to proceed.");
      throw new Error("MetaMask wallet not connected");
    }

    // Register the user on the blockchain
    await registerUserOnBlockchain(address, permission);

    // Send a POST request to the registration endpoint with the user details
    const response = await axios.post('/api/auth/register', {
      username,
      password,
      address,
      permission,
    });

    // If the response status is 201 (Created), registration is successful
    if (response.status === 201) {
      showSuccess("User registered successfully");
      setIsLoggedIn(true);
    } else {
      // If the response status is not 201, show an error and throw an error
      showError("Failed to register user");
      throw new Error("Failed to register user");
    }
    
  } catch (error) {
    // Log the error and show an error message
    showError(error.message || "Registration error");
    throw error;
  }
};

export default handleRegister;