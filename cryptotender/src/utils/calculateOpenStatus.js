/* global BigInt */

const calculateOpenStatus = (endTime) => {
    const now = BigInt(Math.floor(new Date().getTime() / 1000));
    const timeLeft = endTime - now;
    if (timeLeft > BigInt(0)) {
      return 'Open';
    }
    return 'Closed';
  };
  
  export default calculateOpenStatus;