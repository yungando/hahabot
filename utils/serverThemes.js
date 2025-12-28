const { scheduleJob } = require('node-schedule');
const fs = require('node:fs');
const sendLog = require('./sendLog');

const POLLO_SERVER_ID = '534915212760055819';
const HAHABOT_SERVER_ID = '568227296767639552';

const setServerTheme = async (client, guild, theme) => {
  const newIconPath = `./serverIcons/${guild.name}/${theme}.png`;

  if (!fs.existsSync(newIconPath)) return 'Invalid server theme.';

  await guild.setIcon(newIconPath);

  if (guild.id === HAHABOT_SERVER_ID) {
    await client.user.setAvatar(newIconPath);
  }

  return 'Successfully changed server theme.';
};

const initThemeSchedules = async (client) => {
  try {
    const pollo = await client.guilds.fetch(POLLO_SERVER_ID);
    const hahabot = await client.guilds.fetch(HAHABOT_SERVER_ID);

    const halloweenStart = { month: 10, date: 1, hour: 0, minute: 0, tz: 'UTC' };
    const halloweenEnd = { month: 11, date: 1, hour: 0, minute: 0, tz: 'UTC' };

    const christmasStart = { month: 12, date: 1, hour: 0, minute: 0, tz: 'UTC' };
    const christmasDay = { month: 12, date: 25, hour: 0, minute: 0, tz: 'UTC' };

    const newYearsStart = { month: 12, date: 30, hour: 0, minute: 0, tz: 'UTC' };
    const newYearsEnd = { month: 1, date: 2, hour: 0, minute: 0, tz: 'UTC' };

    scheduleJob(halloweenStart, async () => {
      await setServerTheme(client, pollo, 'halloween');
      await setServerTheme(client, hahabot, 'halloween');

      sendLog(client, { logType: 'string', message: 'Set server themes to halloween.' });
    });

    scheduleJob(halloweenEnd, async () => {
      await setServerTheme(client, pollo, 'default');
      await setServerTheme(client, hahabot, 'default');

      sendLog(client, { logType: 'string', message: 'Set server themes to default.' });
    });

    scheduleJob(christmasStart, async () => {
      await setServerTheme(client, pollo, 'christmas');
      await setServerTheme(client, hahabot, 'christmas');

      sendLog(client, { logType: 'string', message: 'Set server themes to christmas.' });
    });

    scheduleJob(christmasDay, async () => {
      await setServerTheme(client, hahabot, 'christmasday');

      sendLog(client, { logType: 'string', message: 'Set server themes to christmas day.' });
    });

    scheduleJob(newYearsStart, async () => {
      await setServerTheme(client, pollo, 'default');
      await setServerTheme(client, hahabot, 'partyhat');

      sendLog(client, { logType: 'string', message: 'Set server themes to new years.' });
    });

    scheduleJob(newYearsEnd, async () => {
      await setServerTheme(client, hahabot, 'default');

      sendLog(client, { logType: 'string', message: 'Set server themes to default.' });
    });
  } catch (error) {
    const errorPayload = {
      logType: 'error',
      details: 'Failed initialising server theme schedules.',
      error,
    };

    sendLog(client, errorPayload);
  }
};

module.exports = {
  initThemeSchedules,
  setServerTheme,
};
