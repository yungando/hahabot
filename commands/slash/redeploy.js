const { ApplicationCommandType, MessageFlags, InteractionContextType } = require('discord.js');

const { clearCommands, registerCommands, loadCommands } = require('../../utils/interactions.js');

module.exports = {
  name: 'redeploy',
  description: 'Redeploy all of hahabot\'s commands.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: '0',
  guilds: [
    '568227296767639552',
  ],
  contexts: [InteractionContextType.Guild],
  async execute(client, interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    await clearCommands(client);
    await loadCommands(client);
    await registerCommands(client);

    await interaction.editReply({ content: 'Successfully redeployed all commands.', flags: MessageFlags.Ephemeral });
  },
};
