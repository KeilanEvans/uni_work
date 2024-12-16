import React from 'react';

const EditBid = ({ bids, tenders, handleEditBid, setCurrentPage, setIsLoggedIn, web3 }) => {
  return (
    <div className="edit-bid-container">
      <h1 className="page-title">Edit Your Bid</h1>
      <form className="edit-bid-form">
        <div className="form-group">
          <label className="form-label">Select Tender:</label>
          <select id="edit-bid-tender-id" className="form-input">
            {Object.keys(bids).map((tenderId) => (
              <option key={tenderId} value={tenderId}>
                {tenders[tenderId]?.name || `Tender ${tenderId}`} - Your Bid: {web3.utils.fromWei(bids[tenderId].amount, "ether")} ETH
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">New Bid Amount (in ETH):</label>
          <input type="number" id="edit-bid-amount" className="form-input" min="0.01" step="0.01" />
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="button edit-bid-button"
            onClick={() => {
              const tenderID = document.getElementById("edit-bid-tender-id").value;
              const bidValue = document.getElementById("edit-bid-amount").value;

              if (!tenderID || !bidValue) {
                alert("All fields are required.");
                return;
              }

              handleEditBid(tenderID, bidValue);
              setCurrentPage('home');
              setIsLoggedIn(true);
            }}
          >
            Submit New Bid
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
    </div>
  );
};

export default EditBid;