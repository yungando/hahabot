const sendLog = require('../utils/sendLog.js');

const { initArchives } = require('../utils/archives.js');
const { loadCommands, clearCommands, registerCommands } = require('../utils/interactions.js');

module.exports = {
  once: true,
  async execute(client) {
    await clearCommands(client);
    await loadCommands(client);
    await registerCommands(client);

    // await loadCommands(client);
    await initArchives(client);

    console.log('ready');
    sendLog(client, 'ready', client.user);
  },
};
