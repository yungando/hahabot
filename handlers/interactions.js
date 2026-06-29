import { readdirSync } from 'node:fs';
import { ApplicationCommandType, REST, Routes } from 'discord.js';

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

    event.once
      ? client.once(eventName, (...args) => event.execute(client, ...args))
      : client.on(eventName, (...args) => event.execute(client, ...args));
  }
};

const clearCommands = (client) => {
  // eslint-disable-next-line no-console
  console.log('Starting clearing old interactions.');

  client.commands.clear();
  client.contextMenus.clear();

  // eslint-disable-next-line no-console
  console.log('Successfully cleared old interactions.');
};

const addGuildCommand = (guildCommands, guildId, command) => {
  const commandSet = guildCommands.get(guildId) ?? [];
  commandSet.push(command);
  guildCommands.set(guildId, commandSet);
};

const loadCommands = async (client) => {
  const globalCommands = [];
  const guildCommands = new Map();

  const commandFiles = readdirSync(commandsDir).flatMap((folder) => {
    const folderUrl = new URL(`${folder}/`, commandsDir);

    return readdirSync(folderUrl)
      .filter((file) => file.endsWith('.js'))
      .map((file) => new URL(file, folderUrl));
  });

  for (const file of commandFiles) {
    const { default: command } = await import(file.href);

    if (command.guilds) {
      for (const guildId of command.guilds) {
        addGuildCommand(guildCommands, guildId, command);
      }
    } else {
      globalCommands.push(command);
    }

    command.type === ApplicationCommandType.ChatInput
      ? client.commands.set(command.name, command)
      : client.contextMenus.set(command.name, command);
  }

  return { globalCommands, guildCommands };
};

const registerCommands = async (client, { globalCommands, guildCommands }) => {
  const clientId = client.application.id;

  // eslint-disable-next-line no-console
  console.log('Started registering application interactions.');

  await rest.put(Routes.applicationCommands(clientId), {
    body: globalCommands,
  });

  for (const [guildId, commands] of guildCommands) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
  }

  // eslint-disable-next-line no-console
  console.log('Successfully registered application interactions.');
};

export {
  clearCommands,
  loadCommands,
  registerCommands,
  syncEvents,
};
