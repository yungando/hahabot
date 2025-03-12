const fs = require('node:fs');
const { token } = require('../config.json');

const { REST, Routes, ApplicationCommandType } = require('discord.js');
const rest = new REST().setToken(token);

const syncEvents = async (client) => {
  const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const [eventName] = file.split('.');
    // eslint-disable-next-line global-require
    const event = require(`../events/${file}`);

    if (event.once) {
      client.once(eventName, (...args) => event.execute(client, ...args));
    } else {
      client.on(eventName, (...args) => event.execute(client, ...args));
    }
  }
};

const clearCommands = async (client) => {
  try {
    console.log('Starting clearing old commands.');

    client.commands.clear();
    client.contextMenus.clear();
    // eslint-disable-next-line no-param-reassign
    client.globalCommands = [];
    // eslint-disable-next-line no-param-reassign
    client.guildCommands = [];

    console.log('Successfully cleared old commands.');
  } catch (error) {
    console.log(error);
  }
};

const reduceGuildCommands = async (guildCommands) => {
  const reducedGuildCommands = guildCommands.reduce((commandsArray, value) => {
    const guildIndex = commandsArray.findIndex((guild) => guild.guildId === value.guildId);

    if (guildIndex > -1) {
      commandsArray[guildIndex].commands.push(...value.commands);
    } else {
      commandsArray.push(value);
    }

    return commandsArray;
  }, []);

  return reducedGuildCommands;
};

const registerCommands = async (client) => {
  const clientId = client.application.id;

  try {
    console.log('Started registering application commands.');

    await rest.put(Routes.applicationCommands(clientId), {
      body: client.globalCommands,
    });

    for (const guild of client.guildCommands) {
      await rest.put(Routes.applicationGuildCommands(clientId, guild.guildId), {
        body: guild.commands,
      });
    }

    console.log('Successfully registered application commands.');
  } catch (error) {
    console.log(error);
  }
};

const loadCommands = async (client) => {
  const guildCommands = [];

  const commandFiles = fs
    .readdirSync('./commands')
    .flatMap((folder) => fs
      .readdirSync(`./commands/${folder}`)
      .filter((file) => file.endsWith('.js'))
      .map((file) => `./commands/${folder}/${file}`));

  for (const file of commandFiles) {
    // eslint-disable-next-line global-require
    const command = require(`.${file}`);

    if (command.guilds) {
      for (const commandsGuildId of command.guilds) {
        guildCommands.push({ guildId: commandsGuildId, commands: [command] });
      }
    } else {
      client.globalCommands.push(command);
    }

    if (command.type === ApplicationCommandType.ChatInput) {
      client.commands.set(command.name, command);
    } else {
      client.contextMenus.set(command.name, command);
    }
  }

  const reducedGuildCommands = await reduceGuildCommands(guildCommands);
  client.guildCommands.push(...reducedGuildCommands);
};

module.exports = {
  syncEvents, clearCommands, registerCommands, loadCommands,
};
