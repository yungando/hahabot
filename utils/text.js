const stripEmojis = (text) => text
  .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
  .replace(/\s{2,}/g, ' ')
  .trim();

const collapseNewlines = (text) => text.replace(/\n+/g, '\n');

export { collapseNewlines, stripEmojis };
