import React, { createContext, useState, useContext } from 'react';

// Create a context for success handling
const SuccessContext = createContext();

// Custom hook to use the SuccessContext
export const useSuccess = () => useContext(SuccessContext);

// SuccessProvider component to wrap the application and provide success context
export const SuccessProvider = ({ children }) => {
  const [success, setSuccess] = useState(null); // State to hold the current success message

  // Function to show a success message
  const showSuccess = (message) => {
    setSuccess(message); // Set the success message
    setTimeout(() => setSuccess(null), 5000); // Hide the success message after 5 seconds
  };

  return (
    // Provide the success state and showSuccess function to the context
    <SuccessContext.Provider value={{ success, showSuccess }}>
      {children} {/* Render the children components */}
    </SuccessContext.Provider>
  );
};