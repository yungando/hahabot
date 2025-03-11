const { ApplicationCommandType, MessageFlags, InteractionContextType } = require('discord.js');

module.exports = {
  name: 'vote',
  type: ApplicationCommandType.Message,
  contexts: [
    InteractionContextType.Guild,
    InteractionContextType.PrivateChannel,
  ],
  async execute(client, interaction) {
    const message = interaction.options.getMessage('message');

    message.react('594816363722309645')
      .then(() => message.react('594816363533565991'));

    interaction.reply({ content: 'Added vote reactions to message.', flags: MessageFlags.Ephemeral });
  },
};
