import sendLog from '../utils/send-log.js';

export default {
  async execute(client, interaction) {
    try {
      if (interaction.partial) await interaction.fetch();

      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        command.execute(client, interaction);
      }

      if (interaction.isContextMenuCommand()) {
        const contextMenu = client.contextMenus.get(interaction.commandName);

        contextMenu.execute(client, interaction);
      }
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
