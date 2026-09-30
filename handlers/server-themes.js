import fs from 'node:fs';
import { Cron } from 'croner';
import { AttachmentBuilder } from 'discord.js';
import { DATES, SERVERS } from '../config/constants.js';
import sendLog from '../utils/send-log.js';

const BASE_PATH = './config/server-themes';

const schedule = (...args) => new Cron(...args);

const setServerTheme = async (client, guild, theme) => {
  const newIconPath = `${BASE_PATH}/${guild.name}/icons/${theme}.png`;

  if (!fs.existsSync(newIconPath)) return 'Invalid server theme.';

  await guild.setIcon(newIconPath);

  if (guild.id === SERVERS.hahabot.id) {
    await client.user.setAvatar(newIconPath);
  }

  return 'Successfully changed server theme.';
};

const sendToGeneral = async (guild, message) => {
  const generalChannel = await guild.channels.cache.find((channel) => channel.name === 'general');

  if (!generalChannel) return 'Couldn\'t find general channel.';

  return await generalChannel.send(message);
};

const sendServerBanner = async (guild, theme) => {
  const bannerPath = `${BASE_PATH}/${guild.name}/banners/${theme}.png`;
  if (!fs.existsSync(bannerPath)) return 'Invalid server theme.';

  const bannerAttachment = new AttachmentBuilder(bannerPath, { name: `${guild.name}-${theme}.png` });

  return await sendToGeneral(guild, { files: [bannerAttachment] });
};

const createThemeRole = async (guild, roleName, roleColour) => {
  const hahaRole = await guild.members.me.roles.botRole;
  const themeRole = await guild.roles.create(
    {
      name: roleName,
      colors: { primaryColor: roleColour },
      position: hahaRole.position,
      permissions: [],
    },
  );

  guild.members.me.roles.add(themeRole);
};

const deleteThemeRole = async (guild, roleName) => await guild.roles.cache
  .find((role) => role.name === roleName)
  ?.delete();

const setHahabotNickname = async (guild, nickname = null) => await guild.members.me
  .setNickname(nickname);

const initThemeSchedules = async (client) => {
  try {
    const pollo = await client.guilds.fetch(SERVERS.pollo.id);
    const hahabot = await client.guilds.fetch(SERVERS.hahabot.id);

    schedule(DATES.halloween.start, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'halloween');
      await setServerTheme(client, pollo, 'halloween');

      await createThemeRole(pollo, 'hahalloween', '#e67e22');
      await setHahabotNickname(pollo, 'hahalloween');
      await sendServerBanner(pollo, 'halloween');

      sendLog(client, { logType: 'string', message: 'Set server themes to Halloween.' });
    });

    schedule(DATES.halloween.day, { timezone: 'Europe/London' }, async () => {
      await sendToGeneral(pollo, 'hh');
    });

    schedule(DATES.halloween.end, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'default');
      await setServerTheme(client, pollo, 'default');

      await deleteThemeRole(pollo, 'hahalloween');
      await setHahabotNickname(pollo);

      sendLog(client, { logType: 'string', message: 'Set server themes to Default.' });
    });

    schedule(DATES.christmas.start, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'christmas');
      await setServerTheme(client, pollo, 'christmas');

      await createThemeRole(pollo, 'hohobot', '#d6001c');
      await setHahabotNickname(pollo, 'hoho');
      await sendServerBanner(pollo, 'christmas');

      sendLog(client, { logType: 'string', message: 'Set server themes to Christmas.' });
    });

    schedule(DATES.christmas.eve, { timezone: 'Europe/London' }, async () => {
      await sendToGeneral(pollo, 'mce');
    });

    schedule(DATES.christmas.day, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'christmas-day');

      await sendToGeneral(pollo, 'mc');

      sendLog(client, { logType: 'string', message: 'Set server themes to Christmas Day.' });
    });

    schedule(DATES.newYears.start, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'partyhat');
      await setServerTheme(client, pollo, 'partyhat');

      await deleteThemeRole(pollo, 'hohobot');
      await setHahabotNickname(pollo);
      await sendServerBanner(pollo, 'partyhat');

      sendLog(client, { logType: 'string', message: 'Set server themes to New Years.' });
    });

    schedule(DATES.newYears.day, { timezone: 'Europe/London' }, async () => {
      await sendToGeneral(pollo, 'hny');
    });

    schedule(DATES.newYears.end, { timezone: 'Europe/London' }, async () => {
      await setServerTheme(client, hahabot, 'default');
      await setServerTheme(client, pollo, 'default');

      sendLog(client, { logType: 'string', message: 'Set server themes to Default.' });
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

export {
  initThemeSchedules,
  setServerTheme,
};
