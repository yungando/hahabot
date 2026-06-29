import { ApplicationCommandOptionType, ApplicationCommandType, InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { SERVERS } from '../../config/constants.js';
import { setServerTheme } from '../../handlers/server-themes.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'theme',
  description: 'Set the server\'s theme.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator,
  guilds: [
    SERVERS.pollo.id,
    SERVERS.hahabot.id,
  ],
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
        { name: 'christmas day', value: 'christmas-day' },
        { name: 'partyhat', value: 'partyhat' },
        { name: 'minecraft', value: 'minecraft' },
        { name: 'original', value: 'original' },
        { name: 'realistic', value: 'realistic' },
      ],
    },
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
