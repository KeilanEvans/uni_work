const handleEditBid = async (contract, account, web3, tenderId, additionalBidAmount) => {
  try {
    if (isNaN(additionalBidAmount) || parseFloat(additionalBidAmount) <= 0) {
      throw new Error("Invalid additional bid amount.");
    }

    const additionalBidAmountWei = web3.utils.toWei(additionalBidAmount.toString(), "ether");

    console.log("Additional amount required in wei:", additionalBidAmountWei);

    const gasEstimate = await contract.methods.reviseBid(tenderId, additionalBidAmountWei).estimateGas({ 
      from: account, 
      value: additionalBidAmountWei.toString() 
    });
    console.log("Gas estimate:", gasEstimate);

    await contract.methods.reviseBid(tenderId, additionalBidAmountWei).send({
      from: account,
      value: additionalBidAmountWei.toString(),
      gasEstimate: gasEstimate
    });

    alert("Bid Updated Successfully");
  } catch (error) {
    console.error("Error editing bid:", error);
    alert("Failed to update bid. Please try again.");
  }
};

export default handleEditBid;