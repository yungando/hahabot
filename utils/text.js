import { time, TimestampStyles } from 'discord.js';

const stripEmojis = (text) => text
  .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
  .replace(/\s{2,}/g, ' ')
  .trim();

const collapseNewlines = (text) => text.replace(/\n+/g, '\n');

const inlineTrim = (text) => collapseNewlines(text.trim()).replaceAll('\n', ' ');

const formatLongNumber = (number = 0) => number.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');

const fullTimestamp = (timestamp) => {
  const correctedTimestamp = Math.round(timestamp / 1000);

  return time(correctedTimestamp, TimestampStyles.FullDateShortTime);
};

const relativeTimestamp = (timestamp) => {
  const correctedTimestamp = Math.round(timestamp / 1000);

  return time(correctedTimestamp, TimestampStyles.RelativeTime);
};

export {
  collapseNewlines,
  formatLongNumber,
  fullTimestamp,
  inlineTrim,
  relativeTimestamp,
  stripEmojis,
};
