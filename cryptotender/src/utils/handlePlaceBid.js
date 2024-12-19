const handlePlaceBid = async (setTenders, contract, account, web3, tenderId, bidAmount) => {
  try {
    await contract.methods.placeBid(tenderId).send({
      from: account,
      value: web3.utils.toWei(bidAmount, "ether"),
    });

    await contract.methods.getTenders().call().then((loadedTenders) => {
      setTenders(loadedTenders);
    });
    
    alert("Bid Placed Successfully");
  } catch (error) {
    console.error("Error placing bid:", error);
  }
};

export default handlePlaceBid;