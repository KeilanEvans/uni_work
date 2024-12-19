import React, { useState } from 'react';
import handleRegister from '../utils/handleRegister';
import FormContainer from './FormContainer';
import { useError } from '../context/ErrorContext';
import { useSuccess } from '../context/SuccessContext';

const Register = ({ setIsLoggedIn, setCurrentPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [permission, setPermission] = useState('');
  const { showError } = useError();
  const { showSuccess } = useSuccess();

  // Handle form submission
  const handleSubmit = async () => {
    // Validate input fields
    if (!username || !password || !address || !permission) {
      showError("All fields are required.");
      return;
    }    
    try {
      // Attempt to register the user
      await handleRegister(username, password, address, permission, setIsLoggedIn, showError);
      showSuccess("Registration Successful!");
      setCurrentPage('home');
    } catch (error) {
      showError("Failed to register. Please try again.");
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
              <option value="">Select Permission Level</option>
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
    </FormContainer>
  );
};

export default Register;