import React, { useState } from 'react';
import handleRegister from '../utils/handleRegister';

const Register = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [permission, setPermission] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password || !address || !permission) {
      alert("All fields are required.");
      return;
    }
    console.log("Registering user:", { username, password, address, permission }); // Debugging statement
    
    try {
      await handleRegister(username, password, address, permission, setIsLoggedIn);
      setIsRegistered(true); // Set isRegistered to true after successful registration
    } catch (error) {
      console.error("Registration failed:", error)
    }
  };

  return (
    <div class="form-container">
      {isRegistered ? (
        <h1>Registration Successful!</h1>
      ) : (
        <>
          <h1>Register</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Ethereum Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <select
            id="permissions"
            name="permission-level"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
          >
            <option value="voter">Voter</option>
            <option value="bidder">Contractor</option>
            <option value="creator">Council</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleSubmit}>Register</button>
        </>
      )}
    </div>
  );
};

export default Register;