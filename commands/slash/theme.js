const {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  MessageFlags,
  InteractionContextType,
} = require('discord.js');

const sendLog = require('../../utils/sendLog.js');
const { setServerTheme } = require('../../utils/serverThemes.js');

module.exports = {
  name: 'theme',
  description: 'Set the server\'s theme.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'default',
      description: 'Return to the server\'s default theme.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'halloween',
      description: 'Apply the server\'s halloween theme.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'christmas',
      description: 'Apply the server\'s christmas theme.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'christmasday',
      description: 'Apply the server\'s christmasDay theme.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'partyhat',
      description: 'Apply the server\'s partyhat theme.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'minecraft',
      description: 'Apply the server\'s minecraft theme.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'original',
      description: 'Apply the server\'s original theme.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'realistic',
      description: 'Apply the server\'s realistic theme.',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  default_member_permissions: '0',
  guilds: [
    '534915212760055819',
    '568227296767639552',
  ],
  contexts: [InteractionContextType.Guild],
  async execute(client, interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const { guild } = interaction;
      const subcommand = await interaction.options.getSubcommand();

      const serverThemeResponse = await setServerTheme(client, guild, subcommand);

      await interaction.editReply({ content: serverThemeResponse, flags: MessageFlags.Ephemeral });

      const logPayload = {
        logType: 'command',
        message: interaction.toString(),
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, logPayload);
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: 'Failed attempting to set server theme.',
        error,
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
