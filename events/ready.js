// eslint-disable-next-line no-unused-vars
const { guildId } = require('../config.json');
const sendLog = require('../utils/sendLog.js');
const sortCategory = require('../utils/sortCategory.js');

module.exports = {
  once: true,
  async execute(client) {
    try {
      console.log('Started setting command permissions.');

      // await client.guilds.cache.get(guildId)?.commands.fetch()
      await client.application.commands.fetch()
        .then((appCommands) => {
          for (const appCommand of appCommands) {
            const [, appCommandData] = appCommand;

            if (appCommandData.defaultPermission === false) {
              if (appCommandData.type !== 'CHAT_INPUT') {
                const { permissions } = client.contextMenus.find((contextMenu) => (
                  contextMenu.name === appCommandData.name
                ));

                appCommandData.permissions.set({ guild: '534915212760055819', permissions });
                return;
              }
              const { permissions } = client.commands.find((command) => (
                command.name === appCommandData.name
              ));

              appCommandData.permissions.set({ guild: '534915212760055819', permissions });
            }
          }
        });

      console.log('Successfully set command permissions.');
    } catch (error) {
      console.log(error);
    }

    console.log('ready');
    sendLog(client, 'ready', client.user);

    const pollo = client.guilds.cache.find((guild) => guild.id === '534915212760055819');
    const gameChannels = pollo.channels.cache.filter((channel) => channel.parentId === '785540936457125888');
    const archivedCategory = pollo.channels.cache.find((channel) => channel.id === '917120901584150589');

    const now = new Date();
    const threeWeeksMs = 1000 * 60 * 60 * 24 * 21;

    gameChannels.forEach((channel) => {
      channel.messages.fetch().then(() => {
        if ((threeWeeksMs + channel.lastMessage.createdTimestamp - now.getTime()) < 0) {
          channel.setParent(archivedCategory, { lockPermissions: true })
            .then(() => {
              sortCategory(archivedCategory);
            });
        } else {
          const timeout = setTimeout(
            () => {
              channel.setParent(archivedCategory, { lockPermissions: true })
                .then(() => {
                  sortCategory(archivedCategory);
                });
            },
            (threeWeeksMs + channel.lastMessage.createdTimestamp - now.getTime()),
          );

          client.archiveTimers.set(`${channel.id}`, timeout);
        }
      });
    });
  },
};
