import React from 'react';
import PropTypes from 'prop-types';

const FormContainer = ({ title, children, onClose }) => {
  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="page-title">{title}</h1>
        <button className="close-button" onClick={onClose}>
          X
        </button>
      </div>
      {children}
    </div>
  );
};

FormContainer.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FormContainer;