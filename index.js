const {
  Client, Collection, GatewayIntentBits, Partials,
} = require('discord.js');

const { token } = require('./config.json');
const { syncEvents } = require('./utils/interactions.js');

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

client.login(token);
