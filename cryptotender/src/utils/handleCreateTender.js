import Web3 from "web3";
const web3 = new Web3()

const handleCreateTender = async (contract, account, setTenders, title, description, bounty, minimumBid, endDate, endTime) => {
  try {
    console.log("Creating tender with values:", { title, description, bounty, minimumBid, endDate, endTime });

    // Create start time for tender.
    const startTimeUnix = Math.floor(new Date().getTime() / 1000);

    // Create end time for tender from parsed parameters.
    const endDateTimeString = `${endDate}T${endTime}:00`;
    const endTimeUnix = Math.floor(new Date(endDateTimeString).getTime() / 1000);

    console.log("Bounty before converting to wei:", bounty)

    // Convert bounty and minimumBid to Wei
    const bountyInWei = web3.utils.toWei(bounty.toString(), 'ether');
    const minimumBidInWei = web3.utils.toWei(minimumBid.toString(), 'ether');

    console.log("Bounty after converting to wei:", bountyInWei)

    const gasEstimate = await contract.methods.createTender(
      title,
      startTimeUnix,
      endTimeUnix,
      bountyInWei,
      minimumBidInWei,
      description
    ).estimateGas({ from: account, value: bountyInWei });
    console.log('Estimated Gas:', gasEstimate);

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

    alert("Tender Created Successfully");
  } catch (error) {
    console.error("Error creating tender:", error);
  }
};

export default handleCreateTender;