import React from 'react';
import { useSuccess } from '../context/SuccessContext';
import '../App.css';

// SuccessPopup component to display success messages
const SuccessPopup = () => {
  const { success } = useSuccess(); // Get the success message from the SuccessContext

  // If there is no success message, do not render anything
  if (!success) return null;

  // Render the success message in a styled popup
  return (
    <div className="success-popup">
      {success}
    </div>
  );
};

export default SuccessPopup;