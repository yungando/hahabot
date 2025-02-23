const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { clientId, guildId, token } = require('./config.json');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(token);

const client = new Client(
  {
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_PRESENCES,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.DIRECT_MESSAGES],
    partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'],
    restRequestTimeout: 60000,
  },
);

const commands = [];
client.commands = new Collection();
client.contextMenus = new Collection();
client.archiveTimers = new Collection();

const commandFiles = fs
  .readdirSync('./commands')
  .flatMap((folder) => fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith('.js'))
    .map((file) => `./commands/${folder}/${file}`));

for (const file of commandFiles) {
  // eslint-disable-next-line global-require
  const command = require(`${file}`);

  commands.push(command);

  if (command.type === '2' || command.type === '3') {
    client.contextMenus.set(command.name, command);
  } else {
    client.commands.set(command.name, command);
  }
}

(async () => {
  try {
    console.log('Started refreshing application commands.');

    // await rest.put(Routes.applicationGuildCommands(clientId, guildId),
    await rest.put(
      Routes.applicationCommands(clientId),
      {
        body: commands,
      },
    );

    console.log('Successfully reloaded application commands.');
  } catch (error) {
    console.log(error);
  }
})();

const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const eventName = file.split('.')[0];
  // eslint-disable-next-line global-require
  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(eventName, (...args) => event.execute(client, ...args));
  } else {
    client.on(eventName, (...args) => event.execute(client, ...args));
  }
}

client.login(token);
