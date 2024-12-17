import React, { useState, useEffect } from 'react';
import { getEthToGbpRate } from '../utils/web3Utils';
import FormContainer from './FormContainer';

const CreateTender = ({ handleCreateTender, setCurrentPage, setIsLoggedIn }) => {
  const [bounty, setBounty] = useState(0);
  const [ethToGbp, setEthToGbp] = useState("0.00");
  const [minBid, setMinBid] = useState(0);
  const [bidEthToGbp, setBidEthToGbp] = useState("0.00");

  useEffect(() => {
    const updateBountyGbpValue = async () => {
      if (!bounty || bounty <= 0) {
        setEthToGbp("0.00"); // Reset when no input or invalid input
        return;
      }

      try {
        const rate = await getEthToGbpRate(); // Fetch ETH-GBP rate
        const converted = (parseFloat(bounty) * rate).toFixed(2); // Convert to GBP
        setEthToGbp(`${converted}`);
      } catch (error) {
        console.error("Error fetching GBP rate for Bounty:", error);
        setEthToGbp("Error");
      }
    };

    updateBountyGbpValue();
  }, [bounty]);

  // Update GBP equivalent for Minimum Bid field
  useEffect(() => {
    const updateMinBidGbpValue = async () => {
      if (!minBid || minBid <= 0) {
        setBidEthToGbp("0.00"); // Reset when no input or invalid input
        return;
      }

      try {
        const rate = await getEthToGbpRate(); // Fetch ETH-GBP rate
        const converted = (parseFloat(minBid) * rate).toFixed(2); // Convert to GBP
        setBidEthToGbp(`${converted}`);
      } catch (error) {
        console.error("Error fetching GBP rate for Minimum Bid:", error);
        setBidEthToGbp("Error");
      }
    };

    updateMinBidGbpValue();
  }, [minBid]);
  
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
        <div>
          <label className="form-label">Bounty (ETH):</label>
          <input
            type="number"
            id="tender-bounty"
            className="form-input"
            onChange={(e) => setBounty(e.target.value)}
            required
          />
          <input
            type="text"
            id="tender-bounty-gbp"
            className="form-input"
            value={`£${ethToGbp}`}
            readOnly
          />
        </div>
        <div>
          <label className="form-label">Minimum Bid (ETH):</label>
          <input
            type="number"
            id="tender-minbid"
            className="form-input"
            onChange={(e) => setMinBid(e.target.value)}
            required
          />
          <input
            type="text"
            id="tender-minbid-gbp"
            className="form-input"
            value={`£${bidEthToGbp}`}
            readOnly
          />
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
              const bounty = Number(document.getElementById("tender-bounty").value);
              const minBid = Number(document.getElementById("tender-minbid").value);

              if (!name || !description || !date || !time || !bounty || !minBid) {
                alert("All fields are required.");
                return;
              }

              if (bounty <= 0 || minBid < 0) {
                alert("Unacceptable values parsed for bounty and minBid. Please parse acceptable values.");
                return;
              }
 
              handleCreateTender(name, description, bounty, minBid, date, time);
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