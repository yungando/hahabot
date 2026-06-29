import { ApplicationCommandOptionType, ApplicationCommandType, InteractionContextType, PermissionFlagsBits } from 'discord.js';
import { SERVERS } from '../../config/constants.js';
import handleRunelitePrices from '../../handlers/runescape-prices.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'prices',
  description: 'Get prices from Old School Runescape',
  guilds: [
    SERVERS.pollo.id,
  ],
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  type: ApplicationCommandType.ChatInput,
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

      const logPayload = {
        logType: 'command',
        message: interaction.toString(),
        user: interaction.user,
        guild: interaction.guild,
      };
      sendLog(client, logPayload);

      const subcommand = await interaction.options.getSubcommand();
      const pricesTable = await handleRunelitePrices(subcommand);

      return interaction.editReply({ content: pricesTable });
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
