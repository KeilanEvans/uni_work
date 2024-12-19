import React from 'react';
import { useError } from '../context/ErrorContext';
import '../App.css';

// ErrorPopup component to display error messages
const ErrorPopup = () => {
  const { error } = useError(); // Get the error message from the ErrorContext

  // If there is no error, do not render anything
  if (!error) return null;

  // Render the error message in a styled popup
  return (
    <div className="error-popup">
      {error}
    </div>
  );
};

export default ErrorPopup;