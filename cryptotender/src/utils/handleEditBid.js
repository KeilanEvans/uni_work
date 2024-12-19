const handleEditBid = async (setTenders, contract, account, web3, tenderId, newBidAmount) => {
  try {
    await contract.methods.reviseBid(tenderId).send({
      from: account,
      value: web3.utils.toWei(newBidAmount, "ether"),
    });
    await contract.methods.getTenders().call().then((loadedTenders) => {
      setTenders(loadedTenders);
    });
    alert("Bid Updated Successfully");
  } catch (error) {
    console.error("Error editing bid:", error);
  }
};

export default handleEditBid;