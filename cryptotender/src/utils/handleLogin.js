import axios from 'axios';

// Function to handle user login
const handleLogin = async (username, password, setIsLoggedIn, onSuccess, showError) => {
  try {
    // Send a POST request to the login endpoint with the username and password
    const response = await axios.post('/api/auth/login', { username, password });

    // If the response status is 200 (OK), login is successful
    if (response.status === 200) {
      // Store the received token in local storage
      localStorage.setItem('token', response.data.token);
      // Set the logged-in state to true
      setIsLoggedIn(true);
      // Call the onSuccess callback function
      onSuccess();
    } else {
      // If the response status is not 200, throw an error
      throw new Error('Login failed');
    }
  } catch (error) {
    showError('Login error:', error);
    if (error.response) {
      showError('Response data:', error.response.data);
      // If the response status is 400, show an invalid username or password error
      if (error.response.status === 400) {
        showError('Invalid username or password');
      } else {
        // Otherwise, show the error message from the response
        showError('Login error: ' + error.response.data.message);
      }
    } else if (error.request) {
      // If there is no response from the server, show a no response error
      showError('No response from server');
    } else {
      // For any other errors, show the error message
      showError('Error: ' + error.message);
    }
  }
};

export default handleLogin;