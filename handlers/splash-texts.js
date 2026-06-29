import { Buffer } from 'node:buffer';
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { QuickDB } from 'quick.db';
import { SERVERS } from '../config/constants.js';
import { inlineTrim } from '../utils/text.js';

const db = new QuickDB();
const config = db.table('config');

const fetchNoContextMessages = async (noContext, cursor) => {
  const result = await noContext.messages.fetch({ after: cursor, limit: 100 });

  const messages = result.sorted((messageA, messageB) => (
    messageA.createdTimestamp - messageB.createdTimestamp
  ));

  return { messages, cursor: messages.lastKey() };
};

const mergeCollections = (collectionA, collectionB) => (
  collectionA.merge(
    collectionB,
    (x) => ({ keep: true, value: x }),
    (y) => ({ keep: true, value: y }),
    (x, y) => ({ keep: true, value: x + y }),
  )
);

const getNoContextMessagesSinceId = async (client, messageId) => {
  const pollo = await client.guilds.fetch(SERVERS.pollo.id);
  const noContext = await pollo.channels.fetch(SERVERS.pollo.channels.noContext.id);
  const { lastMessageId } = noContext;

  if (messageId === lastMessageId) return { messages: undefined, lastMessageId };

  let { messages, cursor } = await fetchNoContextMessages(noContext, messageId);

  while (!messages.some((message) => message.id === lastMessageId)) {
    const result = await fetchNoContextMessages(noContext, cursor);

    messages = mergeCollections(messages, result.messages);
    cursor = result.cursor;
  }

  return { messages, lastMessageId };
};

const createSplashTextLeaderboard = async (client, guild) => {
  const firstMessageId = await config.get('splash.firstMessageId');
  const { messages } = await getNoContextMessagesSinceId(client, firstMessageId);

  const authorCountsMap = new Map();

  for (const { author } of messages.values()) {
    authorCountsMap.set(
      author.id,
      (authorCountsMap.get(author.id) || 0) + 1,
    );
  }

  const authorCounts = Array
    .from(authorCountsMap, ([authorId, count]) => ({ authorId, count }))
    .toSorted((authorA, authorB) => authorB.count - authorA.count);

  const displayNameArray = await Promise.all(
    authorCounts.map(async ({ authorId }, index) => {
      const { displayName } = await guild.members.fetch(authorId);

      return `${index + 1}) **${displayName}**`;
    }),
  );

  const countArray = authorCounts.map(({ count }) => count);

  const leaderboardEmbed = new EmbedBuilder()
    .setAuthor({ name: 'Top Members by #no-context-allowed Submissions' })
    .setColor('#e4590e')
    .addFields(
      { name: 'Member', value: displayNameArray.join('\n'), inline: true },
      { name: 'Count', value: countArray.join('\n'), inline: true },
    );

  return leaderboardEmbed;
};

const getSplashCount = async (client) => {
  const firstMessageId = await config.get('splash.firstMessageId');

  const { messages } = await getNoContextMessagesSinceId(client, firstMessageId);

  return messages.size;
};

const generateSplashUpdateTxt = async (client) => {
  const previousMessageId = await config.get('splash.lastMessageId');
  const { messages, lastMessageId } = await getNoContextMessagesSinceId(client, previousMessageId);

  if (!messages) return { count: 0 };

  const splashTexts = messages.map((message) => {
    if (message.messageSnapshots.size) {
      const forwardedMessage = message.messageSnapshots.first();

      return inlineTrim(forwardedMessage.content);
    }

    return inlineTrim(message.content);
  });

  const count = splashTexts.length;
  const splashTxt = new AttachmentBuilder(
    Buffer.from(splashTexts.join('\n'), 'utf-8'),
    { name: 'splash.txt' },
  );

  return { splashTxt, count, lastMessageId };
};

const setLastSplashMessageId = async (messageId) => {
  await config.set('splash.lastMessageId', messageId);
};

const buildSplashUpdateMessage = (count, splashTxt, lastMessageId, disabled = false) => {
  const seedButton = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setLabel('Seed last splash message id')
    .setCustomId(`splashseed:${lastMessageId}`)
    .setDisabled(disabled);

  const actionRow = new ActionRowBuilder().addComponents(seedButton);

  return {
    content: `${count} minecraft splash texts`,
    ...(splashTxt && { files: [splashTxt] }),
    ...(actionRow && { components: [actionRow], withResponse: true }),
  };
};

export {
  buildSplashUpdateMessage,
  createSplashTextLeaderboard,
  generateSplashUpdateTxt,
  getSplashCount,
  setLastSplashMessageId,
};
