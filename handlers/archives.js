import sendLog from '../utils/send-log.js';

const threeWeeksInMs = 1000 * 60 * 60 * 24 * 21;

const sortCategory = async (channelCategory) => {
  const sortedCategory = channelCategory.children.cache
    .sorted((a, b) => a.name.localeCompare(b.name));

  const categoryPositions = [];

  for (let i = 0; i < sortedCategory.size; i += 1) {
    categoryPositions.push({ channel: sortedCategory.at(i).id, position: i });
  }

  channelCategory.guild.channels.setPositions(categoryPositions);
};

const scheduleArchive = async (client, channelToArchive, timeElapsed = 0) => {
  const archivedCategory = await channelToArchive.guild.channels.fetch('917120901584150589');

  clearTimeout(client.archiveTimers.get(`${channelToArchive.id}`));

  const timeout = setTimeout(
    async () => {
      await channelToArchive.setParent(archivedCategory, { lockPermissions: true });

      sortCategory(archivedCategory);

      sendLog(client, { logType: 'string', message: `Archived <#${channelToArchive.id}>`, guild: channelToArchive.guild });
    },
    (threeWeeksInMs) + timeElapsed,
  );

  client.archiveTimers.set(`${channelToArchive.id}`, timeout);
};

const restoreChannel = async (client, channelToRestore) => {
  const gamesCategory = await channelToRestore.guild.channels.fetch('785540936457125888');

  await channelToRestore.setParent(gamesCategory, { lockPermissions: true });

  sortCategory(gamesCategory);

  scheduleArchive(client, channelToRestore);

  sendLog(client, { logType: 'string', message: `Restored <#${channelToRestore.id}>`, guild: channelToRestore.guild });
};

const initArchives = async (client) => {
  const pollo = await client.guilds.fetch('534915212760055819');
  const gamesCategory = await pollo.channels.cache.filter((channel) => channel.parentId === '785540936457125888');
  const archivedCategory = await pollo.channels.fetch('917120901584150589');

  const nowTimestamp = Date.now();

  gamesCategory.forEach(async (channel) => {
    await channel.messages.fetch({ limit: 1 });
    const lastMessage = await channel.messages.cache.first();

    if ((threeWeeksInMs + lastMessage.createdTimestamp - nowTimestamp) < 0) {
      await channel.setParent(archivedCategory, { lockPermissions: true });

      sortCategory(archivedCategory);

      sendLog(client, { logType: 'string', message: `Archived <#${channel.id}>`, guild: channel.guild });
    } else {
      scheduleArchive(client, channel, lastMessage.createdTimestamp - nowTimestamp);
    }
  });
};

export {
  initArchives,
  restoreChannel,
  scheduleArchive,
  sortCategory,
};
