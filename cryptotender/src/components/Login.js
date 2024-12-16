import React, { useState } from 'react';
import handleLogin from '../utils/handleLogin';
import FormContainer from './FormContainer';

const Login = ({ setIsLoggedIn, setCurrentPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!username || !password) {
      alert("All fields are required.");
      return;
    }
    handleLogin(username, password, setIsLoggedIn, () => setCurrentPage('home'));
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