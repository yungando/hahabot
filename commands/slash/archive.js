const { ApplicationCommandType, MessageFlags, InteractionContextType } = require('discord.js');

const { sortCategory } = require('../../utils/archives.js');

module.exports = {
  name: 'archive',
  description: 'Archive this channel.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: '0',
  guilds: [
    '534915212760055819',
  ],
  contexts: [InteractionContextType.Guild],
  async execute(client, interaction) {
    const { channel_id: channelToArchive } = interaction;
    const gamesCategory = interaction.guild.channels.cache.find((c) => c.id === '785540936457125888');
    const archivedCategory = interaction.guild.channels.cache.find((c) => c.id === '917120901584150589');
    const retiredCategory = interaction.guild.channels.cache.find((c) => c.id === '562373109555134496');

    if (channelToArchive.parent === gamesCategory) {
      clearTimeout(client.archiveTimers.get(`${channelToArchive.id}`));

      await channelToArchive.setParent(archivedCategory, { lockPermissions: true });

      sortCategory(archivedCategory);

      interaction.reply({ content: `Moved <#${channelToArchive.id}> to \`#${archivedCategory.name}\``, flags: MessageFlags.Ephemeral });
    } else {
      channelToArchive.setParent(retiredCategory, { lockPermissions: true });

      interaction.reply({ content: `Moved <#${channelToArchive.id}> to \`#${retiredCategory.name}\``, flags: MessageFlags.Ephemeral });
    }
  },
};
