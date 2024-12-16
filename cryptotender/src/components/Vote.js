import React from 'react';

const Vote = ({ tenders, handleVote, setCurrentPage, setIsLoggedIn }) => {
  return (
    <div className="vote-container">
      <h1 className="page-title">Vote on a Tender</h1>
      <form className="vote-form">
        <div className="form-group">
          <label className="form-label">Select Tender:</label>
          <select id="vote-tender-id" className="form-input">
            {tenders.map((tender, index) => (
              <option key={index} value={tender.id}>
                {tender.name} - Votes: {tender.votes}
              </option>
            ))}
          </select>
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="button vote-button"
            onClick={() => {
              const vote = document.getElementById("vote-tender-id").value;

              if (!vote) {
                alert("Please select a tender to vote on!");
                return;
              }

              handleVote(vote);
              setCurrentPage('home');
              setIsLoggedIn(true);
            }}
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
    </div>
  );
};

export default Vote;