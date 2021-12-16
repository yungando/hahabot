const sendLog = require("../utils/sendLog.js");

module.exports =
{
    async execute(client, interaction)
    {
        var member = interaction.member;

        if (!member.roles.cache.some(role => role.id == '599755089908989953')) return interaction.reply({ content: 'locals only', ephemeral: true });

        if (!member.roles.cache.some(role => role.id == '920796155464540242'))
        {
            member.roles.add('920796155464540242');

            interaction.reply({ content: 'Given access to <#920796092990378014>', ephemeral: true });
        }
        else
        {
            member.roles.remove('920796155464540242');

            interaction.reply({ content: 'Removed access to <#920796092990378014>', ephemeral: true });
        }
    }
}