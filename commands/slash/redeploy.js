import { ApplicationCommandType, InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { SERVERS } from '../../config/constants.js';
import { clearCommands, loadCommands, registerCommands } from '../../handlers/interactions.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'redeploy',
  description: 'Redeploy all of hahabot\'s commands.',
  guilds: [
    SERVERS.hahabot.id,
  ],
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.Guild],
  async execute(client, interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      await clearCommands(client);
      const commands = await loadCommands(client);
      await registerCommands(client, commands);

      await interaction.editReply({ content: 'Successfully redeployed all commands.', flags: MessageFlags.Ephemeral });

      const logPayload = {
        logType: 'command',
        message: '/redeploy',
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, logPayload);
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: 'Failed attempting to redeploy commands.',
        error,
      };

      sendLog(client, errorPayload);
    }
  },
};
