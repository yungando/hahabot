import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { syncEvents } from './handlers/interactions.js';

const { DISCORD_TOKEN } = process.env;

const client = new Client(
  {
    intents: [
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildExpressions,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [
      Partials.User,
      Partials.Channel,
      Partials.GuildMember,
      Partials.Message,
      Partials.Reaction,
    ],
    restRequestTimeout: 60000,
  },
);

client.globalCommands = [];
client.guildCommands = [];

client.commands = new Collection();
client.contextMenus = new Collection();
client.archiveTimers = new Collection();

syncEvents(client);

client.login(DISCORD_TOKEN);
