import axios from 'axios';

const handleRegister = async (username, password, address, setIsLoggedIn) => {
  try {
    const response = await axios.post('/api/auth/register', {
      username,
      password,
      address,
    });
    console.log("Registration response:", response); // Debugging statement
    alert(response.data.message);
    setIsLoggedIn(true);
  } catch (error) {
    console.error("Registration error:", error); // Debugging statement
    alert(error.response?.data?.message || "Registration failed");
  }
};

export default handleRegister;