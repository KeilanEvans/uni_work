import React, { useRef, useEffect } from 'react';
import FormContainer from './FormContainer';
import { useError } from '../context/ErrorContext';
import { useSuccess } from '../context/SuccessContext';
import handleVote from '../utils/handleVote';

const Vote = ({ tenders, contract, account, setCurrentPage, setIsLoggedIn }) => {
  const selectRef = useRef(null);
  const { showError } = useError();
  const { showSuccess } = useSuccess();

  // Handle form submission
  const handleSubmit = async () => {
    const tenderId = parseInt(selectRef.current.value);

    // Validate if a tender is selected
    if (!tenderId) {
      showError("Please select a tender to vote on!");
      return;
    }

    try {
      // Attempt to submit the vote
      await handleVote(contract, account, tenderId, showError);
      showSuccess("Vote submitted successfully!");
      setCurrentPage('home');
      setIsLoggedIn(true);
    } catch (error) {
      showError("Failed to submit vote. Please try again.");
    }
  };

  return (
    <FormContainer
      title="Vote on a Tender"
      onClose={() => {
        setCurrentPage('home');
        setIsLoggedIn(true);
      }}
    >
      <form className="vote-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label className="form-label">Select Tender:</label>
          <select id="vote-tender-id" className="form-input" ref={selectRef}>
            <option value="">Select a tender</option>
            {tenders.map((tender, index) => (
              <option key={index} value={tender.id.toString()}>
                {tender.title} - Votes: {tender.votes.toString()}
              </option>
            ))}
          </select>
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="button create-button"
            onClick={handleSubmit}
          >
            Submit Vote
          </button>
          <button
            type="button"
            className="button back-button"
            onClick={() => {
              setCurrentPage('home');
              setIsLoggedIn(true);
            }}
          >
            Back to Home
          </button>
        </div>
      </form>
    </FormContainer>
  );
};

export default Vote;