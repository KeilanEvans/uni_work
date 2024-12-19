// Function to handle placing a bid
const handlePlaceBid = async (contract, account, web3, tenderId, bidAmount, showError, showSuccess) => {
  try {
    // Check if contract is defined
    if (!contract) {
      showError("Contract is not initialized. Please try again later.");
      return;
    }

    // Convert the bid amount to Wei
    const bidAmountInWei = web3.utils.toWei(bidAmount, "ether");

    // Send a transaction to place the bid for the specified tender
    await contract.methods.placeBid(tenderId).send({
      from: account,
      value: bidAmountInWei,
    });

    // Show a success alert
    showSuccess("Bid Placed Successfully");
  } catch (error) {
    // Show an error message if the bid placement fails
    showError(error.message || "Error placing bid");
  }
};

export default handlePlaceBid;