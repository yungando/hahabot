import { ApplicationCommandOptionType, ApplicationCommandType, MessageFlags, InteractionContextType } from 'discord.js';

import sendLog from '../../utils/sendLog.js';
import { setServerTheme } from '../../utils/serverThemes.js';

export default {
  name: 'theme',
  description: 'Set the server\'s theme.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'theme',
      description: 'Select the desired server theme.',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'default', value: 'default' },
        { name: 'halloween', value: 'halloween' },
        { name: 'christmas', value: 'christmas' },
        { name: 'christmas day', value: 'christmasDay' },
        { name: 'partyhat', value: 'partyhat' },
        { name: 'minecraft', value: 'minecraft' },
        { name: 'original', value: 'original' },
        { name: 'realistic', value: 'realistic' },
      ],
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
      const theme = await interaction.options.getString('theme', true);

      const serverThemeResponse = await setServerTheme(client, guild, theme);

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
