import React from 'react';
import FormContainer from './FormContainer';
import { useError } from '../context/ErrorContext';
import { useSuccess } from '../context/SuccessContext';
import handlePlaceBid from '../utils/handlePlaceBid';

const PlaceBid = ({ tenders, web3, contract, account, setCurrentPage, setIsLoggedIn }) => {
  const { showError } = useError();
  const { showSuccess } = useSuccess();

  return (
    <FormContainer
      title="Place a Bid"
      onClose={() => {
        setCurrentPage('home');
        setIsLoggedIn(true);
      }}
    >
      <form className="bid-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label className="form-label">Select Tender:</label>
          <select id="bid-tender-id" className="form-input">
            <option value="">Select a tender...</option> {/* Default option */}
            {tenders
              .filter((tender) => tender.isOpen) // Only tenders in the bidding phase
              .map((tender, index) => (
                <option key={tender.id.toString()} value={tender.id.toString()}>
                  {tender.title} - Current Highest Bid: {web3.utils.fromWei(tender.highestBid, "ether")} ETH
                </option>
              ))
            }
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Bid Amount (in ETH):</label>
          <input type="number" id="bid-amount" className="form-input" min="0.01" step="0.01" />
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="button create-button"
            onClick={async () => {
              const tenderID = document.getElementById("bid-tender-id").value;
              const bidValue = document.getElementById("bid-amount").value;
              
              // Validate input fields
              if (!tenderID || !bidValue) {
                showError("All fields are required.");
                return;
              }

              try {
                // Attempt to place the bid
                await handlePlaceBid(contract, account, web3, tenderID, bidValue, showError, showSuccess);
                setCurrentPage('home');
                setIsLoggedIn(true);
              } catch (error) {
                showError("Failed to place bid. Please try again.");
              }
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
    </FormContainer>
  );
};

export default PlaceBid;