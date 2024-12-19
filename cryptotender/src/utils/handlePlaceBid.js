const handlePlaceBid = async (contract, account, web3, tenderId, bidAmount) => {
  try {
    const bidAmountInWei = web3.utils.toWei(bidAmount, "ether");
    console.log("Bid value in Wei:", bidAmountInWei);
    const gasEstimate = await contract.methods.placeBid(tenderId).estimateGas({ from: account, value: bidAmountInWei });
    console.log("Gas estimate:", gasEstimate);

    await contract.methods.placeBid(tenderId).send({
      from: account,
      value: bidAmountInWei,
    });

    alert("Bid Placed Successfully");
  } catch (error) {
    console.error("Error placing bid:", error);
  }
};

export default handlePlaceBid;