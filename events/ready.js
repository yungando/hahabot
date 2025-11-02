const sendLog = require('../utils/sendLog.js');

const { initArchives } = require('../utils/archives.js');
const { loadCommands } = require('../utils/interactions.js');

module.exports = {
  once: true,
  async execute(client) {
    await loadCommands(client);
    await initArchives(client);

    console.log('ready');
    sendLog(client, { logType: 'string', message: 'ready' });
  },
};
