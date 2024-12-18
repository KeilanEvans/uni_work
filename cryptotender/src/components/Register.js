import React, { useState } from 'react';
import handleRegister from '../utils/handleRegister';
import FormContainer from './FormContainer';

const Register = ({ setIsLoggedIn, setCurrentPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [permission, setPermission] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState(null); // null, 'success', or 'failed'

  const handleSubmit = async () => {
    if (!username || !password || !address || !permission) {
      alert("All fields are required.");
      return;
    }
    console.log("Registering user:", { username, password, address, permission }); // Debugging statement
    
    try {
      await handleRegister(username, password, address, permission, setIsLoggedIn);
      setRegistrationStatus('success'); // Set registrationStatus to 'success' after successful registration
    } catch (error) {
      console.error("Registration failed:", error);
      setRegistrationStatus('failed'); // Set registrationStatus to 'failed' if registration fails
    }
  };

  return (
    <FormContainer
      title="Register"
      onClose={() => {
        setCurrentPage('home');
        setIsLoggedIn(false);
      }}
    >
      {registrationStatus === 'success' ? (
        <h1>Registration Successful!</h1>
      ) : registrationStatus === 'failed' ? (
        <h1>Registration Failed!</h1>
      ) : (
        <form className="register-form" onSubmit={(e) => e.preventDefault()}>
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
          <div className="form-group">
            <label className="form-label">Permission Level:</label>
            <select
              id="permissions"
              name="permission-level"
              className="form-input"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
            >
              <option value="voter">Voter</option>
              <option value="bidder">Contractor</option>
              <option value="creator">Council</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-buttons">
            <button type="button" className="button create-button" onClick={handleSubmit}>
              Register
            </button>
          </div>
        </form>
      )}
    </FormContainer>
  );
};

export default Register;