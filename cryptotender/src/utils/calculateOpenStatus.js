/* global BigInt */

// Function to calculate the open status of a tender based on its end time
const calculateOpenStatus = (endTime) => {
  // Get the current time in Unix timestamp as a BigInt
  const now = BigInt(Math.floor(new Date().getTime() / 1000));
  
  // Calculate the time left until the tender closes
  const timeLeft = endTime - now;
  
  // If time left is greater than 0, the tender is open
  if (timeLeft > BigInt(0)) {
    return 'Open';
  }
  
  // Otherwise, the tender is closed
  return 'Closed';
};

export default calculateOpenStatus;