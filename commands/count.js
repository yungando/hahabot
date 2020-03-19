const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{
    var guild = message.guild;

    if (guild.id !== '534915212760055819')
    {
        message.delete();

        return;
    }

    var roles = [   '534919438726856735', // locals
                    '654449509421678632', // regulars
                    '663509082522779671', // fashion crawl '20
                    '643358780553428992', // undying
                    '612481505482244097', // mmxix
                    '580279000115707914', // iron burden
                    '579902430331011072', // fashion crawl 19
                    '628794671069528064', // s8
                    '534919307784618015', // s7
                    '552534486894772239', // s6
                    '536913425503092736', // s5
                    '585548115243696170', // nitro
                    '574652778857627654', // drinking buddy
                    '547564202638704650', // MIA
                    '534925628680437783', // lfg
                    '539645535754256387', // comp
                    '683797344889864258'];// agent

    var rolesField = [`@everyone`];
    var countField = [`${guild.memberCount}`];

    for (var i = 0; i < roles.length; i++)
    {
        let role = guild.roles.cache.find(r => r.id === roles[i]);

        rolesField.push(`<@&${roles[i]}>`);
        countField.push(`${role.members.array().length}`);
    }

    rolesField.join('\u000D');
    countField.join('\u000D');

    let id = '560533863290372097';
    let hahaGuild = message.guild.members.cache.get(id);
    let hahaClient = client.users.cache.get(id);

    let color = hahaGuild.displayHexColor;
    if (color == '#000000') {
        color = '#99aab5';
    }

    const embed = new Discord.MessageEmbed()
    .setAuthor('Pub Crawl', guild.iconURL())
    .setColor('#241132')
    .addField('Role', rolesField, true)
    .addField('Count', countField, true)
    .setFooter('~count')
    .setTimestamp(message.createdTimestamp);
    
    message.channel.send(embed);

    message.delete();
}