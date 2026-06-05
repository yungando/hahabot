import { ApplicationCommandType, InteractionContextType, MessageFlags } from 'discord.js';
import { clearCommands, loadCommands, registerCommands } from '../../handlers/interactions.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'redeploy',
  description: 'Redeploy all of hahabot\'s commands.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: '0',
  guilds: [
    '568227296767639552',
  ],
  contexts: [InteractionContextType.Guild],
  async execute(client, interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      await clearCommands(client);
      await loadCommands(client);
      await registerCommands(client);

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
