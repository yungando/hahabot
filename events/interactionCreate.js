const { ApplicationCommandType } = require('discord.js');
const sendLog = require('../utils/sendLog.js');

module.exports = {
  async execute(client, interaction) {
    if (interaction.partial) await interaction.fetch();

    if (interaction.commandType === ApplicationCommandType.ChatInput) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(client, interaction);
      } catch (error) {
        sendLog(client, error.toString(), client.user);
      } finally {
        sendLog(client, interaction.toString(), interaction.user, interaction.guild);
      }

      return;
    }

    const contextMenu = client.contextMenus.get(interaction.commandName);

    if (!contextMenu) return;

    try {
      await contextMenu.execute(client, interaction);
    } catch (error) {
      sendLog(client, error.toString(), client.user);
    } finally {
      sendLog(client, interaction.commandName, interaction.user, interaction.guild);
    }
  },
};
