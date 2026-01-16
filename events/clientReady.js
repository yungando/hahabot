import { initArchives } from '../utils/archives.js';
import { loadCommands } from '../utils/interactions.js';
import sendLog from '../utils/sendLog.js';
import { initThemeSchedules } from '../utils/serverThemes.js';

export default {
  once: true,
  async execute(client) {
    await loadCommands(client);
    await initArchives(client);
    await initThemeSchedules(client);

    // eslint-disable-next-line no-console
    console.log('ready');
    sendLog(client, { logType: 'string', message: 'ready' });
  },
};
