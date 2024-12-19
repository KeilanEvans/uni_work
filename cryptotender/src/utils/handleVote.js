// Function to handle voting on a tender
const handleVote = async (contract, account, tenderId, showError) => {
  try {
    // Send a transaction to vote for the specified tender
    await contract.methods.vote(tenderId).send({ from: account });

    // Show a success alert
    alert("Vote Submitted Successfully");
  } catch (error) {
    // Show an error message if the voting fails
    showError(error.message || "Error voting");
  }
};

export default handleVote;