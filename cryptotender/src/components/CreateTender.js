import React, { useState, useEffect } from 'react';
import { getEthToGbpRate } from '../utils/web3Utils';
import FormContainer from './FormContainer';

const CreateTender = ({ handleCreateTender, setCurrentPage, setIsLoggedIn }) => {
  const [bounty, setBounty] = useState('');
  const [ethToGbp, setEthToGbp] = useState("0.00");
  const [minBid, setMinBid] = useState('');
  const [bidEthToGbp, setBidEthToGbp] = useState("0.00");
  const [ethGbpRate, setEthGbpRate] = useState(null);
  const [rateError, setRateError] = useState(null);

  // Fetch ETH to GBP rate once when component mounts
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const rate = await getEthToGbpRate();
        setEthGbpRate(rate);
      } catch (error) {
        console.error("Error fetching ETH to GBP rate:", error);
        setRateError("Failed to fetch ETH to GBP rate. Please try again later.");
      }
    };
    fetchRate();
  }, []);

  // Update GBP equivalent for Bounty field
  useEffect(() => {
    if (ethGbpRate && bounty > 0) {
      const converted = (parseFloat(bounty) * ethGbpRate).toFixed(2);
      setEthToGbp(converted);
    } else {
      setEthToGbp("0.00");
    }
  }, [bounty, ethGbpRate]);

  // Update GBP equivalent for Minimum Bid field
  useEffect(() => {
    if (ethGbpRate && minBid > 0) {
      const converted = (parseFloat(minBid) * ethGbpRate).toFixed(2);
      setBidEthToGbp(converted);
    } else {
      setBidEthToGbp("0.00");
    }
  }, [minBid, ethGbpRate]);

  const handleSubmit = () => {
    const name = document.getElementById("tender-name").value.trim();
    const description = document.getElementById("tender-description").value.trim();
    const date = document.getElementById("tender-date").value;
    const time = document.getElementById("tender-time").value;
    const bountyValue = Number(document.getElementById("tender-bounty").value);
    const minBidValue = Number(document.getElementById("tender-minbid").value);

    // Validation
    if (!name || !description || !date || !time || !bountyValue || !minBidValue) {
      alert("All fields are required.");
      return;
    }

    if (bountyValue <= 0 || minBidValue < 0) {
      alert("Unacceptable values parsed for bounty and minBid. Please enter acceptable values.");
      return;
    }

    if (!ethGbpRate) {
      alert("ETH to GBP rate not available. Please try again later.");
      return;
    }

    handleCreateTender(name, description, bountyValue, minBidValue, date, time);
    setCurrentPage('home');
    setIsLoggedIn(true);
  };

  return (
    <FormContainer
      title="Create a New Tender"
      onClose={() => {
        setCurrentPage('home');
        setIsLoggedIn(true);
      }}
    >
      <form className="tender-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label className="form-label">Tender Name:</label>
          <input 
            type="text" 
            id="tender-name" 
            className="form-input" 
            required 
            placeholder="Enter tender name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description:</label>
          <textarea 
            id="tender-description" 
            className="form-input form-textarea" 
            placeholder="Enter tender description"
          ></textarea>
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label className="form-label">Close Date:</label>
            <input 
              type="date" 
              id="tender-date" 
              className="form-input" 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Close Time:</label>
            <input 
              type="time" 
              id="tender-time" 
              className="form-input" 
              required 
            />
          </div>
        </div>
        <div className="form-group-inline">
          <div>
            <label className="form-label">Bounty (ETH):</label>
            <input
              type="number"
              id="tender-bounty"
              className="form-input"
              value={bounty}
              onChange={(e) => setBounty(e.target.value)}
              required
              placeholder="e.g. 1.5"
            />
            <input
              type="text"
              id="tender-bounty-gbp"
              className="form-input"
              value={`£${ethToGbp}`}
              readOnly
              placeholder="GBP equivalent"
            />
          </div>
          <div>
            <label className="form-label">Minimum Bid (ETH):</label>
            <input
              type="number"
              id="tender-minbid"
              className="form-input"
              value={minBid}
              onChange={(e) => setMinBid(e.target.value)}
              required
              placeholder="e.g. 0.5"
            />
            <input
              type="text"
              id="tender-minbid-gbp"
              className="form-input"
              value={`£${bidEthToGbp}`}
              readOnly
              placeholder="GBP equivalent"
            />
          </div>
        </div>
        {rateError && (
          <div className="error-message">
            {rateError}
          </div>
        )}
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

              console.log("Form values:", { name, description, date, time, bounty, minBid });

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
            ></button>
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="button create-button"
            onClick={handleSubmit}    
          >
            Create Tender
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

export default CreateTender;
