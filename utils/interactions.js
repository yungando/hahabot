import { readdirSync } from 'node:fs';
import { REST, Routes, ApplicationCommandType } from 'discord.js';

const { DISCORD_TOKEN } = process.env;
const rest = new REST().setToken(DISCORD_TOKEN);

const eventsDir = new URL('../events/', import.meta.url);
const commandsDir = new URL('../commands/', import.meta.url);

const syncEvents = async (client) => {
  const eventFiles = readdirSync(eventsDir).filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const [eventName] = file.split('.');
    const eventUrl = new URL(file, eventsDir);
    const { default: event } = await import(eventUrl.href);

    if (event.once) {
      client.once(eventName, (...args) => event.execute(client, ...args));
    } else {
      client.on(eventName, (...args) => event.execute(client, ...args));
    }
  }
};

const clearCommands = async (client) => {
  console.log('Starting clearing old commands.');

  client.commands.clear();
  client.contextMenus.clear();
  // eslint-disable-next-line no-param-reassign
  client.globalCommands = [];
  // eslint-disable-next-line no-param-reassign
  client.guildCommands = [];

  console.log('Successfully cleared old commands.');
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
};

const loadCommands = async (client) => {
  const guildCommands = [];

  const commandFiles = readdirSync(commandsDir)
    .flatMap((folder) => {
      const folderUrl = new URL(`${folder}/`, commandsDir);

      return readdirSync(folderUrl)
        .filter((file) => file.endsWith('.js'))
        .map((file) => new URL(file, folderUrl));
    });

  for (const file of commandFiles) {
    const { default: command } = await import(file.href);

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

export {
  syncEvents,
  clearCommands,
  registerCommands,
  loadCommands,
};
