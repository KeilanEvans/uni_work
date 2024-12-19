const handleVote = async (setTenders, contract, account, tenderId) => {
  try {
    await contract.methods.vote(tenderId).send({ from: account });
    
    await contract.methods.getTenders().call().then((loadedTenders) => {
      setTenders(loadedTenders);
    });
    alert("Vote Submitted Successfully");
  } catch (error) {
    console.error("Error voting:", error);
  }
};

export default handleVote;