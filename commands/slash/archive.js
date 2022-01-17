const sortCategory = require("../../utils/sortCategory.js");

module.exports =
{
    name: 'archive',
    description: 'Archive this channel.',
    default_permission: false,
    permissions:
    [{
        id: '269555580425863168',
        type: 2,
        permission: true
    }],
    async execute(client, interaction)
    {
        if (interaction.guild.id != '534915212760055819') // pollo
        {
            interaction.reply({ content: 'Can\t do that in this server.', ephemeral: true });

            return;
        }

        var channel = interaction.channel;
        var gamesCategory = interaction.guild.channels.cache.find(channel => channel.id === '785540936457125888');
        var archivedCategory = interaction.guild.channels.cache.find(channel => channel.id === '917120901584150589');
        var retiredCategory = interaction.guild.channels.cache.find(channel => channel.id === '562373109555134496');

        if (channel.parent == gamesCategory)
        {
            clearTimeout(client.archiveTimers.get(`${channel.id}`));
            
            channel.setParent(archivedCategory, { lockPermissions: true })
                .then(() =>
                {
                    sortCategory(archivedCategory);
                });

            interaction.reply({ content: `Moved <#${channel.id}> to \`#${archivedCategory.name}\``, ephemeral: true });
        }
        else
        {
            channel.setParent(retiredCategory, { lockPermissions: true });

            interaction.reply({ content: `Moved <#${channel.id}> to \`#${retiredCategory.name}\``, ephemeral: true });
        }
    }
}