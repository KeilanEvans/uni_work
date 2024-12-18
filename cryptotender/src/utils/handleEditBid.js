const handleEditBid = async (contract, account, web3, tenderId, newBidAmount) => {
  try {
    await contract.methods.reviseBid(tenderId).send({
      from: account,
      value: web3.utils.toWei(newBidAmount, "ether"),
    });
    alert("Bid Updated Successfully");
  } catch (error) {
    console.error("Error editing bid:", error);
  }
};

export default handleEditBid;