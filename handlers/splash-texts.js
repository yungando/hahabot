import { EmbedBuilder } from 'discord.js';

const POLLO_SERVER_ID = '534915212760055819';
const noContextId = '1247871597080084490';

// const tempCursorId = '1474577944314777682';
const FIRST_MESSAGE_ID = '1247871734716170250';

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
  try {
    const pollo = await client.guilds.fetch(POLLO_SERVER_ID);
    const noContext = await pollo.channels.fetch(noContextId);
    const mostRecentNoContext = noContext.lastMessageId;

    let { messages, cursor } = await fetchNoContextMessages(noContext, messageId);

    while (!messages.some((message) => message.id === mostRecentNoContext)) {
      const result = await fetchNoContextMessages(noContext, cursor);

      messages = mergeCollections(messages, result.messages);
      cursor = result.cursor;
    }

    return messages;
  } catch (error) {
    console.error(error);

    return undefined;
  }
};

const createSplashTextLeaderboard = async (client, guild) => {
  const messages = await getNoContextMessagesSinceId(client, FIRST_MESSAGE_ID);

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
  const messages = await getNoContextMessagesSinceId(client, FIRST_MESSAGE_ID);

  return messages.size;
};

const generateSplashUpdateTxt = () => {
  // const noContextMessagesSinceLastUpdate = await noContext.messages
  //   .fetch({ after: tempCursorId, limit: 100 });

  // console.log(noContextMessagesSinceLastUpdate.size);

  // const allNoContextMessages = await noContext.messages.cache
  //   .sorted((messageA, messageB) => messageA.createdTimestamp - messageB.createdTimestamp);

  // const allSplashTexts = allNoContextMessages.map((message) => {
  //   if (message.messageSnapshots.size) {
  //     const forwardedMessage = message.messageSnapshots.first();

  //     return forwardedMessage.content;
  //   }

  //   return message.content.trim();
  // }); // .join('\n');

  // console.log(allSplashTexts.length);
  // console.log(allSplashTexts);
};

export {
  createSplashTextLeaderboard,
  generateSplashUpdateTxt,
  getNoContextMessagesSinceId,
  getSplashCount,
};
