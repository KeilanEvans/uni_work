import React from 'react';
import PropTypes from 'prop-types';

// FormContainer component to wrap forms with a title and close button
const FormContainer = ({ title, children, onClose }) => {
  return (
    <div className="form-container">
      <div className="form-header">
        {/* Display the title of the form */}
        <h1 className="page-title">{title}</h1>
        {/* Close button to trigger the onClose function */}
        <button className="close-button" onClick={onClose}>
          X
        </button>
      </div>
      {/* Render the children components (form elements) */}
      {children}
    </div>
  );
};

// Define prop types for the FormContainer component
FormContainer.propTypes = {
  title: PropTypes.string.isRequired, // Title is a required string
  children: PropTypes.node.isRequired, // Children are required nodes (elements)
  onClose: PropTypes.func.isRequired, // onClose is a required function
};

export default FormContainer;