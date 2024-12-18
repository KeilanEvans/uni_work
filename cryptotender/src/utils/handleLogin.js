import axios from 'axios';

const handleLogin = async (username, password, setIsLoggedIn, navigateToHome) => {
  try {
    const response = await axios.post('/api/auth/login', {
      username,
      password,
    });
    localStorage.setItem('token', response.data.token);
    alert('Login successful');
    setIsLoggedIn(true);
    navigateToHome();
  } catch (error) {
    alert(error.response.data.message);
  }
};

export default handleLogin;