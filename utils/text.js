const stripEmojis = (text) => text
  .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
  .replace(/\s{2,}/g, ' ')
  .trim();

const collapseNewlines = (text) => text.replace(/\n+/g, '\n');

const inlineTrim = (text) => collapseNewlines(text.trim()).replaceAll('\n', ' ');

export { collapseNewlines, inlineTrim, stripEmojis };
