const sendLog = require('./sendLog.js');

const threeWeeksInMs = 1000 * 60 * 60 * 24 * 21;

const sortCategory = async (channelCategory) => {
  const sortedCategory = channelCategory.children.sort((a, b) => a.name.localeCompare(b.name));
  const categoryPositions = [];

  for (let i = 0; i < sortedCategory.size; i + 1) {
    categoryPositions.push({ channel: sortedCategory.at(i).id, position: i });
  }

  channelCategory.guild.channels.setPositions(categoryPositions);
};

const scheduleArchive = async (client, channelToArchive, timeElapsed = 0) => {
  const pollo = client.guilds.cache.find((guild) => guild.id === '534915212760055819');
  const archivedCategory = pollo.channels.cache.find((channel) => channel.id === '917120901584150589');

  clearTimeout(client.archiveTimers.get(`${channelToArchive.id}`));

  const timeout = setTimeout(
    async () => {
      await channelToArchive.setParent(archivedCategory, { lockPermissions: true });

      sortCategory(archivedCategory);

      sendLog(client, `Archived <#${channelToArchive.id}>`, client.user);
    },
    (threeWeeksInMs) + timeElapsed,
  );

  client.archiveTimers.set(`${channelToArchive.id}`, timeout);
};

const restoreChannel = async (client, channelToRestore) => {
  const gamesCategory = channelToRestore.guild.channels.cache.filter((channel) => (channel.parentId === '785540936457125888'));

  await channelToRestore.setParent(gamesCategory, { lockPermissions: true });

  sortCategory(gamesCategory);

  scheduleArchive(client, channelToRestore);

  sendLog(client, `Restored <#${channelToRestore.id}>`, client.user);
};

const initArchives = async (client) => {
  const pollo = client.guilds.cache.find((g) => g.id === '534915212760055819');
  const gamesCategory = pollo.channels.cache.filter((channel) => channel.parentId === '785540936457125888');
  const archivedCategory = pollo.channels.cache.find((channel) => channel.id === '917120901584150589');

  const nowTimestamp = Date.now();

  gamesCategory.forEach(async (channel) => {
    await channel.messages.fetch();

    if ((threeWeeksInMs + channel.lastMessage.createdTimestamp - nowTimestamp) < 0) {
      await channel.setParent(archivedCategory, { lockPermissions: true });

      sortCategory(archivedCategory);
    } else {
      scheduleArchive(client, channel, channel.lastMessage.createdTimestamp - nowTimestamp);
    }
  });
};

module.exports = {
  initArchives, sortCategory, scheduleArchive, restoreChannel,
};
