import React, { useRef, useEffect } from 'react';

const Vote = ({ tenders, handleVote, setCurrentPage, setIsLoggedIn }) => {
  const selectRef = useRef(null);

  useEffect(() => {
    console.log("Tenders:", tenders); // Debugging statement
  }, [tenders]);

  const handleSubmit = () => {
    const vote = selectRef.current.value;
    console.log("Selected vote:", vote); // Debugging statement

    if (!vote) {
      alert("Please select a tender to vote on!");
      return;
    }

    handleVote(vote);
    setCurrentPage('home');
    setIsLoggedIn(true);
  };

  return (
    <div className="vote-container">
      <h1 className="page-title">Vote on a Tender</h1>
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
            className="button vote-button"
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
    </div>
  );
};

export default Vote;