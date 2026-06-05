import { ApplicationCommandOptionType, ApplicationCommandType, InteractionContextType, MessageFlags } from 'discord.js';
import handleRunelitePrices from '../../handlers/runescape-prices.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'prices',
  description: 'Get prices from Old School Runescape',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: '0',
  guilds: [
    '534915212760055819',
  ],
  contexts: [InteractionContextType.Guild],
  options: [
    {
      name: 'deadman',
      description: 'Get Deadman Reward Shop prices.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'leagues',
      description: 'Get Leagues Reward Shop prices.',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  async execute(client, interaction) {
    try {
      await interaction.deferReply();

      const subcommand = await interaction.options.getSubcommand();

      const logPayload = {
        logType: 'command',
        message: interaction.toString(),
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, logPayload);

      switch (subcommand) {
        case 'deadman': {
          const pricesTable = await handleRunelitePrices('Deadman');
          const reply = `\`\`\`\n${pricesTable}\n\`\`\``;

          return interaction.editReply({ content: reply });
        }
        case 'leagues': {
          const pricesTable = await handleRunelitePrices('Leagues');
          const reply = `\`\`\`\n${pricesTable}\n\`\`\``;

          return interaction.editReply({ content: reply });
        }
        default: {
          return interaction.editReply({ content: '( ͡° ͜ʖ ͡°)', flags: MessageFlags.Ephemeral });
        }
      }
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: 'Failed attempting to run prices command',
        error,
        user: interaction.user,
        guild: interaction.guild,
      };

      return sendLog(client, errorPayload);
    }
  },
};
