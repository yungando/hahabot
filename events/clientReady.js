import { log } from 'node:console';
import { initArchives } from '../handlers/archives.js';
import { loadCommands } from '../handlers/interactions.js';
import { initThemeSchedules } from '../handlers/server-themes.js';
import sendLog from '../utils/send-log.js';

export default {
  once: true,
  async execute(client) {
    await loadCommands(client);
    await initArchives(client);
    await initThemeSchedules(client);

    log('ready');
    sendLog(client, { logType: 'string', message: 'ready' });
  },
};
