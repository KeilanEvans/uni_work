import React from 'react';
import FormContainer from './FormContainer';

const CreateTender = ({ handleCreateTender, setCurrentPage, setIsLoggedIn }) => {
  return (
    <FormContainer
      title="Create a New Tender"
      onClose={() => {
        setCurrentPage('home');
        setIsLoggedIn(true);
      }}
    >
      <form className="tender-form">
        <div className="form-group">
          <label className="form-label">Tender Name:</label>
          <input type="text" id="tender-name" className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Description:</label>
          <textarea id="tender-description" className="form-input form-textarea"></textarea>
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label className="form-label">Close Date:</label>
            <input type="date" id="tender-date" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Close Time:</label>
            <input type="time" id="tender-time" className="form-input" required />
          </div>
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="button create-button"
            onClick={() => {
              const name = document.getElementById("tender-name").value;
              const description = document.getElementById("tender-description").value;
              const date = document.getElementById("tender-date").value;
              const time = document.getElementById("tender-time").value;

              if (!name || !description || !date || !time) {
                alert("All fields are required.");
                return;
              }

              handleCreateTender(name, description, date, time);
              setCurrentPage('home');
              setIsLoggedIn(true);
            }}
          >
            Create Tender
          </button>
          <button
            type="button"
            className="button back-button"
            onClick={() => setCurrentPage('home')}
          >
            Back to Home
          </button>
        </div>
      </form>
    </FormContainer>
  );
};

export default CreateTender;