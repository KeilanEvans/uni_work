import React, { useState } from 'react';
import FormContainer from './FormContainer';
import handleLogin from '../utils/handleLogin';
import { useError } from '../context/ErrorContext';
import { useSuccess } from '../context/SuccessContext';

// Login component
const Login = ({ setCurrentPage, setIsLoggedIn }) => {
  // State variables for username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { showError } = useError();
  const { showSuccess } = useSuccess();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Attempt to log in the user
      await handleLogin(username, password, setIsLoggedIn, () => {
        setCurrentPage('home');
        showSuccess("Login Successful!");
      }, showError);
    } catch (error) {
      // Show error message if login fails
      showError(error.message || "Login failed");
    }
  };

  return (
    <FormContainer
      title="Login"
      onClose={() => {
        setCurrentPage('home');
        setIsLoggedIn(false);
      }}
    >
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username:</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password:</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="button create-button">Login</button>
        </div>
      </form>
    </FormContainer>
  );
};

export default Login;