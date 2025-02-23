const sortCategory = require('../../utils/sortCategory.js');

module.exports = {
  name: 'archive',
  description: 'Archive this channel.',
  default_permission: false,
  permissions: [{
    id: '269555580425863168',
    type: 2,
    permission: true,
  }],
  async execute(client, interaction) {
    if (interaction.guild.id !== '534915212760055819') return interaction.reply({ content: 'Can\t do that in this server.', ephemeral: true });

    const { channel: channelToArchive } = interaction;
    const gamesCategory = interaction.guild.channels.cache.find((channel) => channel.id === '785540936457125888');
    const archivedCategory = interaction.guild.channels.cache.find((channel) => channel.id === '917120901584150589');
    const retiredCategory = interaction.guild.channels.cache.find((channel) => channel.id === '562373109555134496');

    if (channelToArchive.parent === gamesCategory) {
      clearTimeout(client.archiveTimers.get(`${channelToArchive.id}`));

      channelToArchive.setParent(archivedCategory, { lockPermissions: true })
        .then(() => {
          sortCategory(archivedCategory);
        });

      return interaction.reply({ content: `Moved <#${channelToArchive.id}> to \`#${archivedCategory.name}\``, ephemeral: true });
    }
    channelToArchive.setParent(retiredCategory, { lockPermissions: true });

    return interaction.reply({ content: `Moved <#${channelToArchive.id}> to \`#${retiredCategory.name}\``, ephemeral: true });
  },
};
