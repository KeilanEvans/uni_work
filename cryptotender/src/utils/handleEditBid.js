// Function to handle editing a bid
const handleEditBid = async (contract, account, web3, tenderId, additionalBidAmount, showError, showSuccess) => {
  try {
    // Send a transaction to revise the bid for the specified tender
    if (isNaN(additionalBidAmount) || parseFloat(additionalBidAmount) <= 0) {
      throw new Error("Invalid additional bid amount.");
    }

    const additionalBidAmountWei = web3.utils.toWei(additionalBidAmount.toString(), "ether");

    const gasEstimate = await contract.methods.reviseBid(tenderId, additionalBidAmountWei).estimateGas({ 
      from: account, 
      value: additionalBidAmountWei.toString()  // Convert the bid amount to Wei
    });


    // Fetch the updated list of tenders and update the state
    await contract.methods.reviseBid(tenderId, additionalBidAmountWei).send({
      from: account,
      value: additionalBidAmountWei.toString(),
      gasEstimate: gasEstimate
    });


    // Show a success alert
    showSuccess("Bid Updated Successfully");
  } catch (error) {
    // Show an error message if the bid update fails
    showError(error.message || "Error editing bid");
  }
};

export default handleEditBid;