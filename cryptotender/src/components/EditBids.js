import React, { useState, useEffect } from 'react';
import FormContainer from './FormContainer';
import { useError } from '../context/ErrorContext';
import { useSuccess } from '../context/SuccessContext';
import handleEditBid from '../utils/handleEditBid';

const EditBid = ({ bids, tenders, contract, account, setTenders, setCurrentPage, setIsLoggedIn, web3 }) => {
  const [selectedTenderId, setSelectedTenderId] = useState('');
  const [newBidAmount, setNewBidAmount] = useState('');
  const { showError } = useError();
  const { showSuccess } = useSuccess();

  // Convert the dual arrays into an object for easier access
  const [bidData, setBidData] = useState({});

  useEffect(() => {
    if (bids.tenderIds && bids.bidAmounts) {
      const combined = {};
      for (let i = 0; i < bids.tenderIds.length; i++) {
        const tenderId = bids.tenderIds[i].toString(); // Ensure tenderId is a string
        combined[tenderId] = {
          amount: bids.bidAmounts[i].toString(),
        };
      }
      setBidData(combined);
    }
  }, [bids]);

  const handleSubmit = async () => {
    // Validate input fields
    if (!selectedTenderId || !newBidAmount) {
      showError("All fields are required.");
      return;
    }

    const newBidAmountFloat = parseFloat(newBidAmount);
  
    if (isNaN(newBidAmountFloat) || newBidAmount <= 0) {
      showError("Bid amount must be greater than 0.");
      return;
    }
  
    const existingBidAmountWei = bidData[selectedTenderId].amount;
    const existingBidAmountEth = parseFloat(web3.utils.fromWei(existingBidAmountWei, "ether"));
    
    if (newBidAmountFloat <= existingBidAmountEth) {
      showError("Your new bid must be higher than your existing bid.");
      return;
    }

    const additionalBidAmount = (newBidAmountFloat - existingBidAmountEth).toString();

    try {
      await handleEditBid(selectedTenderId, additionalBidAmount);
      showError("Bid updated successfully!");
      setCurrentPage('home');
      setIsLoggedIn(true);
    } catch (error) {
      showError("Failed to update bid. Please try again.");
    }
  };

  return (
    <FormContainer
      title="Edit Bid"
      onClose={() => {
        setCurrentPage('home');
        setIsLoggedIn(true);
      }}
    >
      <form className="edit-bid-form" onSubmit={(e) => e.preventDefault()}>
        {/* Select Tender */}
        <div className="form-group">
          <label className="form-label">Select Tender:</label>
          <select
            id="edit-bid-tender-id"
            className="form-input"
            value={selectedTenderId}
            onChange={(e) => setSelectedTenderId(e.target.value)}
            required
          >
            <option value="" disabled>Select a tender</option>
            {Object.keys(bidData).map((tenderId) => (
              <option key={tenderId} value={tenderId}>
                {tenders[tenderId]?.title || `Tender ${tenderId}`} - Your Bid: {web3.utils.fromWei(bidData[tenderId].amount, "ether")} ETH
              </option>
            ))}
          </select>
        </div>

        {/* New Bid Amount */}
        <div className="form-group">
          <label className="form-label">New Bid Amount (in ETH):</label>
          <input
            type="number"
            id="edit-bid-amount"
            className="form-input"
            value={newBidAmount}
            onChange={(e) => setNewBidAmount(e.target.value.toString())}
            required
            placeholder="e.g. 1.5"
          />
        </div>

        {/* Form Buttons */}
        <div className="form-buttons">
          <button
            type="button"
            className="button create-button"
            onClick={handleSubmit}
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
    </FormContainer>
  );
};

export default EditBid;