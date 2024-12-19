import React, { useRef, useEffect } from 'react';
import FormContainer from './FormContainer';

const Vote = ({ tenders, handleVote, setCurrentPage, setIsLoggedIn }) => {
  const selectRef = useRef(null);

  useEffect(() => {
    console.log("Tenders:", tenders); // Debugging statement
  }, [tenders]);

  const handleSubmit = () => {
    const tenderId = parseInt(selectRef.current.value);
    console.log("Selected vote:", tenderId); // Debugging statement

    if (!tenderId) {
      alert("Please select a tender to vote on!");
      return;
    }

    handleVote(tenderId);
    setCurrentPage('home');
    setIsLoggedIn(true);
  };

  return (
    <FormContainer
      title="Vote on a Tender"
      onClose={() => {
        setCurrentPage('home');
        setIsLoggedIn(true);
      }}
    >
      <form className="vote-form">
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