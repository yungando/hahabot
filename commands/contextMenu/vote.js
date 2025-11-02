const { ApplicationCommandType, MessageFlags, InteractionContextType } = require('discord.js');
const sendLog = require('../../utils/sendLog.js');

module.exports = {
  name: 'vote',
  type: ApplicationCommandType.Message,
  contexts: [
    InteractionContextType.Guild,
    InteractionContextType.PrivateChannel,
  ],
  async execute(client, interaction) {
    const message = interaction.options.getMessage('message');

    await message.react('594816363722309645');
    await message.react('594816363533565991');

    interaction.reply({ content: 'Added vote reactions to message.', flags: MessageFlags.Ephemeral });

    const logPayload = {
      logType: 'command',
      message: `/vote: ${message.url}`,
      user: interaction.user,
      guild: interaction.guild,
    };

    sendLog(client, logPayload);
  },
};
