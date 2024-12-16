/* global BigInt */

const calculateTimeLeftInt = (endTime) => {
  const now = BigInt(Math.floor(new Date().getTime() / 1000));
  const timeLeft = endTime - now;
  return timeLeft;
};

export default calculateTimeLeftInt;