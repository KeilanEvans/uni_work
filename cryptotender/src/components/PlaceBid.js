import React from 'react';

const PlaceBid = ({ tenders, web3, handlePlaceBid, setCurrentPage, setIsLoggedIn }) => {
  return (
    <div className="bid-container">
      <h1 className="page-title">Place a Bid</h1>
      <form className="bid-form">
        <div className="form-group">
          <label className="form-label">Select Tender:</label>
          <select id="bid-tender-id" className="form-input">
            {tenders
              .filter((tender) => !tender.isOpen && tender.highestBidder === "0x0000000000000000000000000000000000000000") // Only tenders in the bidding phase
              .map((tender, index) => (
                <option key={index} value={tender.id.toString()}>
                  {tender.title} - Current Highest Bid: {web3.utils.fromWei(tender.highestBid, "ether")} ETH
                </option>
              ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Bid Amount (in ETH):</label>
          <input type="number" id="bid-amount" className="form-input" min="0.01" step="0.01" />
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="button bid-button"
            onClick={() => {
              const tenderID = document.getElementById("bid-tender-id").value;
              const bidValue = document.getElementById("bid-amount").value;

              if (!tenderID || !bidValue) {
                alert("All fields are required.");
                return;
              }

              handlePlaceBid(tenderID, bidValue);
              setCurrentPage('home');
              setIsLoggedIn(true);
            }}
          >
            Submit Bid
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

export default PlaceBid;