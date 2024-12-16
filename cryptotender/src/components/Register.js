import React, { useState } from 'react';
import handleRegister from '../utils/handleRegister';
import FormContainer from './FormContainer';

const Register = ({ setIsLoggedIn, setCurrentPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = () => {
    if (!username || !password || !address) {
      alert("All fields are required.");
      return;
    }
    console.log("Registering user:", { username, password, address }); // Debugging statement
    handleRegister(username, password, address, setIsLoggedIn);
    setIsRegistered(true); // Set isRegistered to true after successful registration
  };

  return (
    <FormContainer
      title="Register"
      onClose={() => {
        setCurrentPage('home');
        setIsLoggedIn(false);
      }}
    >
      {isRegistered ? (
        <h1>Registration Successful!</h1>
      ) : (
        <form className="register-form">
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
          <div className="form-group">
            <label className="form-label">Ethereum Address:</label>
            <input
              type="text"
              placeholder="Ethereum Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-buttons">
            <button onClick={handleSubmit} className="button create-button">Register</button>
          </div>
        </form>
      )}
    </FormContainer>
  );
};

export default Register;