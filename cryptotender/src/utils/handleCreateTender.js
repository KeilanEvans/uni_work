import Web3 from "web3";
const web3 = new Web3();

const handleCreateTender = async (contract, account, setTenders, title, description, bounty, minimumBid, endDate, endTime, showError, showSuccess) => {
  try {
    // Check if contract is defined
    if (!contract) {
      showError("Contract is not initialized. Please try again later.");
      return;
    }

    // Create start time for tender.
    const startTimeUnix = Math.floor(new Date().getTime() / 1000);

    // Create end time for tender from parsed parameters.
    const endDateTimeString = `${endDate}T${endTime}:00`;
    const endTimeUnix = Math.floor(new Date(endDateTimeString).getTime() / 1000);

    // Convert bounty and minimumBid to Wei
    const bountyInWei = web3.utils.toWei(bounty.toString(), 'ether');
    const minimumBidInWei = web3.utils.toWei(minimumBid.toString(), 'ether');

    const gasEstimate = await contract.methods.createTender(
      title,
      startTimeUnix,
      endTimeUnix,
      bountyInWei,
      minimumBidInWei,
      description
    ).estimateGas({ from: account, value: bountyInWei });

    // Add to Blockchain
    await contract.methods
      .createTender(title, startTimeUnix, endTimeUnix, bountyInWei, minimumBidInWei, description)
      .send({ 
        from: account,
        value: bountyInWei
       });

    // Now we need to sync our understanding of the tenders on the blockchain
    await contract.methods.getTenders().call().then((loadedTenders) => {
      setTenders(loadedTenders);
    });

    // Show success message only if no errors occur
    showSuccess("Tender Created Successfully");
  } catch (error) {
    showError(error.message || "Error creating tender");
  }
};

export default handleCreateTender;