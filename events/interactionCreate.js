import { ApplicationCommandType } from 'discord.js';
import sendLog from '../utils/send-log.js';

export default {
  async execute(client, interaction) {
    if (interaction.partial) await interaction.fetch();

    if (interaction.commandType === ApplicationCommandType.ChatInput) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(client, interaction);
      } catch (error) {
        const errorPayload = {
          logType: 'error',
          details: `Failed attempting to handle interaction: ${interaction.toString()}`,
          error,
          user: interaction.user,
          guild: interaction.guild,
        };

        sendLog(client, errorPayload);
      }

      return;
    }

    const contextMenu = client.contextMenus.get(interaction.commandName);

    if (!contextMenu) return;

    try {
      await contextMenu.execute(client, interaction);
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: `Failed attempting to handle interaction: ${interaction.toString()}`,
        error,
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
