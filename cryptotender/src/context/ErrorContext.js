import React, { createContext, useState, useContext } from 'react';

// Create a context for error handling
const ErrorContext = createContext();

// Custom hook to use the ErrorContext
export const useError = () => useContext(ErrorContext);

// ErrorProvider component to wrap the application and provide error context
export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null); // State to hold the current error message

  // Function to show an error message
  const showError = (message) => {
    setError(message); // Set the error message
    setTimeout(() => setError(null), 5000); // Hide the error message after 5 seconds
  };

  return (
    // Provide the error state and showError function to the context
    <ErrorContext.Provider value={{ error, showError }}>
      {children} {/* Render the children components */}
    </ErrorContext.Provider>
  );
};