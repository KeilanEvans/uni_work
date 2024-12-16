/* global BigInt */

const WEEK_SECONDS = BigInt(7 * 24 * 3600);
const DAY_SECONDS = BigInt(24 * 3600);
const HOUR_SECONDS = BigInt(3600);
const MINUTE_SECONDS = BigInt(60);

const calculateTimeLeftStr = (endTime) => {
  const now = BigInt(Math.floor(new Date().getTime() / 1000));
  let timeLeft = endTime - now;

  if (timeLeft <= 0) {
    return 'Voting Ended';
  }

  // Calculate weeks
  const weeks = timeLeft / WEEK_SECONDS;
  timeLeft %= WEEK_SECONDS;

  // Calculate days
  const days = timeLeft / DAY_SECONDS;
  timeLeft %= DAY_SECONDS;

  // Calculate hours
  const hours = timeLeft / HOUR_SECONDS;
  timeLeft %= HOUR_SECONDS;

  // Calculate minutes
  const minutes = timeLeft / MINUTE_SECONDS;

  // Remaining seconds
  const seconds = timeLeft % MINUTE_SECONDS;

  let parts = [];
  if (weeks > 0n) parts.push(`${weeks} week${weeks > 1n ? 's' : ''}`);
  if (days > 0n) parts.push(`${days} day${days > 1n ? 's' : ''}`);
  if (hours > 0n) parts.push(`${hours} hr${hours > 1n ? 's' : ''}`);
  if (minutes > 0n) parts.push(`${minutes} min${minutes > 1n ? 's' : ''}`);
  if (seconds > 0n) parts.push(`${seconds} sec${seconds > 1n ? 's' : ''}`);

  // If all units are zero but time is still positive (unlikely), default to seconds
  if (parts.length === 0 && timeLeft > 0) {
    parts.push(`${seconds} sec${seconds > 1n ? 's' : ''}`);
  }

  return parts.join(', ');
};

export default calculateTimeLeftStr;