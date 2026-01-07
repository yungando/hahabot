import sendLog from '../utils/sendLog.js';
import { initArchives } from '../utils/archives.js';
import { loadCommands } from '../utils/interactions.js';
import { initThemeSchedules } from '../utils/serverThemes.js';

export default {
  once: true,
  async execute(client) {
    await loadCommands(client);
    await initArchives(client);
    await initThemeSchedules(client);

    console.log('ready');
    sendLog(client, { logType: 'string', message: 'ready' });
  },
};
