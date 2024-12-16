/* global BigInt */

// Method to calculate countdown timer value from a Tender's end date/time unix value
const calculateTimeLeftStr = (endTime) => {
  const now = BigInt(Math.floor(new Date().getTime() / 1000));
  const timeLeft = endTime - now;
  if (timeLeft > 0) {
    const hours = timeLeft / BigInt(3600);
    const minutes = (timeLeft % BigInt(3600)) / BigInt(60);
    const seconds = timeLeft % BigInt(60);

    return `${
      hours.toString().padStart(2, '0')
    }:${
      minutes.toString().padStart(2, '0')
    }:${
      seconds.toString().padStart(2, '0')
    }`;
  }
  return 'Voting Ended';
};

export default calculateTimeLeftStr;