const handleCreateTender = async (contract, account, setTenders, title, description, bounty, minimumBid, endDate, endTime) => {
  try {
    // Create start time for tender.
    const startTimeUnix = Math.floor(new Date().getTime() / 1000);

    // Create end time for tender from parsed parameters.
    const endDateTimeString = `${endDate}T${endTime}:00`;
    const endTimeUnix = Math.floor(new Date(endDateTimeString).getTime() / 1000);

    // Add to Blockchain
    await contract.methods
      .createTender(title, startTimeUnix, endTimeUnix, bounty, minimumBid, description)
      .send({ from: account });
    
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