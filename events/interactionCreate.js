import { ApplicationCommandType } from 'discord.js';
import sendLog from '../utils/send-log.js';

export default {
  async execute(client, interaction) {
    try {
      if (interaction.partial) await interaction.fetch();

      switch (interaction.commandType) {
        case ApplicationCommandType.ChatInput: {
          const command = client.commands.get(interaction.commandName);

          return command.execute(client, interaction);
        }
        case ApplicationCommandType.User: {
          const contextMenu = client.contextMenus.get(interaction.commandName);

          return contextMenu.execute(client, interaction);
        }
        case ApplicationCommandType.Message: {
          const [buttonName, ...buttonData] = interaction.data.custom_id.split(':');
          const button = client.buttons.get(buttonName);

          return button.execute(client, interaction, buttonData);
        }
        default: return undefined;
      }
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: `Failed attempting to handle interaction: ${interaction.toString()}`,
        error,
        user: interaction.user,
        guild: interaction.guild,
      };

      return sendLog(client, errorPayload);
    }
  },
};
