/* global BigInt */

// Function to calculate the time left until a tender closes, in seconds
const calculateTimeLeftInt = (endTime) => {
  // Get the current time in Unix timestamp as a BigInt
  const now = BigInt(Math.floor(new Date().getTime() / 1000));
  
  // Calculate the time left until the tender closes
  const timeLeft = endTime - now;
  
  // Return the time left
  return timeLeft;
};

export default calculateTimeLeftInt;