const handleVote = async (contract, account, tenderId) => {
  try {
    await contract.methods.vote(tenderId).send({ from: account });
    alert("Vote Submitted Successfully");
  } catch (error) {
    console.error("Error voting:", error);
  }
};

export default handleVote;