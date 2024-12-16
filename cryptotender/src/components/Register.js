import React, { useState } from 'react';
import handleRegister from '../utils/handleRegister';

const Register = ({ setIsLoggedIn }) => {
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
          <button onClick={handleSubmit}>Register</button>
        </>
      )}
    </div>
  );
};

export default Register;