const { Cron } = require('croner');
const fs = require('node:fs');
const sendLog = require('./sendLog');
const { AttachmentBuilder } = require('discord.js');

const POLLO_SERVER_ID = '534915212760055819';
const HAHABOT_SERVER_ID = '568227296767639552';

const schedule = (...args) => new Cron(...args);

const setServerTheme = async (client, guild, theme) => {
  const newIconPath = `./serverthemes/${guild.name}/icons/${theme}.png`;

  if (!fs.existsSync(newIconPath)) return 'Invalid server theme.';

  await guild.setIcon(newIconPath);

  if (guild.id === HAHABOT_SERVER_ID) {
    await client.user.setAvatar(newIconPath);
  }

  return 'Successfully changed server theme.';
};

const sendServerBanner = async (guild, theme) => {
  const bannerPath = `./serverthemes/${guild.name}/banners/${theme}.png`;
  const generalChannel = guild.channels.cache.find((channel) => channel.name === 'general');

  if (!fs.existsSync(bannerPath)) return 'Invalid server theme.';
  if (!generalChannel) return 'Couldn\'t find general channel.';

  const bannerAttachment = new AttachmentBuilder(bannerPath, { name: `${guild.name}-${theme}.png` });
  return await generalChannel.send({ files: [bannerAttachment] });
};

const createThemeRole = async (guild, roleName, roleColour) => {
  const hahaRole = await guild.members.me.roles.botRole;
  const themeRole = await guild.roles.create(
    {
      name: roleName,
      color: roleColour,
      position: hahaRole.position,
      permissions: [],
    },
  );

  guild.members.me.roles.add(themeRole);
};

const deleteThemeRole = async (guild, roleName) => await guild.roles.cache.find((role) => role.name === roleName)?.delete();

const setHahabotNickname = async (guild, nickname = null) => await guild.members.me.setNickname(nickname);

const initThemeSchedules = async (client) => {
  try {
    const pollo = await client.guilds.fetch(POLLO_SERVER_ID);
    const hahabot = await client.guilds.fetch(HAHABOT_SERVER_ID);

    const halloweenStart = '0 0 1 10 *';
    const halloweenEnd = '0 0 1 11 *';

    const christmasStart = '0 0 1 12 *';
    const christmasDay = '0 0 25 12 *';

    const newYearsStart = '0 0 30 12 *';
    const newYearsEnd = '0 0 2 1 *';

    schedule(halloweenStart, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'halloween');
      await setServerTheme(client, pollo, 'halloween');

      await createThemeRole(pollo, 'hahalloween', '#e67e22');
      await setHahabotNickname(pollo, 'hahalloween');
      await sendServerBanner(pollo, 'halloween');

      sendLog(client, { logType: 'string', message: 'Set server themes to halloween.' });
    });

    schedule(halloweenEnd, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'default');
      await setServerTheme(client, pollo, 'default');

      await deleteThemeRole(pollo, 'hahalloween');
      await setHahabotNickname(pollo);

      sendLog(client, { logType: 'string', message: 'Set server themes to default.' });
    });

    schedule(christmasStart, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'christmas');
      await setServerTheme(client, pollo, 'christmas');

      await createThemeRole(pollo, 'hohobot', '#d6001c');
      await setHahabotNickname(pollo, 'hoho');
      await sendServerBanner(pollo, 'christmas');

      sendLog(client, { logType: 'string', message: 'Set server themes to christmas.' });
    });

    schedule(christmasDay, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'christmasDay');

      sendLog(client, { logType: 'string', message: 'Set server themes to christmas day.' });
    });

    schedule(newYearsStart, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'partyhat');
      await setServerTheme(client, pollo, 'default');

      await deleteThemeRole(pollo, 'hohobot');
      await setHahabotNickname(pollo);

      sendLog(client, { logType: 'string', message: 'Set server themes to new years.' });
    });

    schedule(newYearsEnd, { timezone: 'Europe/London' }, async () => {
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
