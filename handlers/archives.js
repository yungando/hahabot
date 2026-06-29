import { SERVERS } from '../config/constants.js';
import sendLog from '../utils/send-log.js';

const threeWeeksInMs = 1000 * 60 * 60 * 24 * 21;

const sortCategory = async (channelCategory) => {
  const sortedCategory = channelCategory.children.cache
    .sorted((a, b) => a.name.localeCompare(b.name));

  const categoryPositions = [];

  for (let i = 0; i < sortedCategory.size; i += 1) {
    categoryPositions.push({ channel: sortedCategory.at(i).id, position: i });
  }

  await channelCategory.guild.channels.setPositions(categoryPositions);
};

const scheduleArchive = async (client, channelToArchive, timeElapsed = 0) => {
  const archivedCategory = await channelToArchive.guild.channels
    .fetch(SERVERS.pollo.categories.archivedGames.id);

  clearTimeout(client.archiveTimers.get(`${channelToArchive.id}`));

  const timeout = setTimeout(
    async () => {
      await channelToArchive.setParent(archivedCategory, { lockPermissions: true });

      await sortCategory(archivedCategory);

      sendLog(client, { logType: 'string', message: `Archived <#${channelToArchive.id}>`, guild: channelToArchive.guild });
    },
    (threeWeeksInMs) + timeElapsed,
  );

  client.archiveTimers.set(`${channelToArchive.id}`, timeout);
};

const restoreChannel = async (client, channelToRestore) => {
  const gamesCategory = await channelToRestore.guild.channels
    .fetch(SERVERS.pollo.categories.games.id);

  await channelToRestore.setParent(gamesCategory, { lockPermissions: true });

  await sortCategory(gamesCategory);

  await scheduleArchive(client, channelToRestore);

  sendLog(client, { logType: 'string', message: `Restored <#${channelToRestore.id}>`, guild: channelToRestore.guild });
};

const initArchives = async (client) => {
  const pollo = await client.guilds.fetch(SERVERS.pollo.id);
  const gamesCategoryChannels = await pollo.channels.cache
    .filter((channel) => channel.parentId === SERVERS.pollo.categories.games.id);
  const archivedCategory = await pollo.channels
    .fetch(SERVERS.pollo.categories.archivedGames.id);

  const nowTimestamp = Date.now();

  await gamesCategoryChannels.forEach(async (channel) => {
    await channel.messages.fetch({ limit: 1 });
    const lastMessage = await channel.messages.cache.first();

    if ((threeWeeksInMs + lastMessage.createdTimestamp - nowTimestamp) < 0) {
      await channel.setParent(archivedCategory, { lockPermissions: true });

      await sortCategory(archivedCategory);

      sendLog(client, { logType: 'string', message: `Archived <#${channel.id}>`, guild: channel.guild });
    } else {
      await scheduleArchive(client, channel, lastMessage.createdTimestamp - nowTimestamp);
    }
  });
};

export {
  initArchives,
  restoreChannel,
  scheduleArchive,
  sortCategory,
};
