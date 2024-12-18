const handlePlaceBid = async (contract, account, web3, tenderId, bidAmount) => {
  try {
    await contract.methods.placeBid(tenderId).send({
      from: account,
      value: web3.utils.toWei(bidAmount, "ether"),
    });
    alert("Bid Placed Successfully");
  } catch (error) {
    console.error("Error placing bid:", error);
  }
};

export default handlePlaceBid;