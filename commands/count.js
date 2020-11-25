const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{
    var guild = message.guild;

    if (guild.id !== '534915212760055819')
    {
        message.delete();

        return;
    }

    var roles = [   '599755089908989953', // pint
                    '534919438726856735', // locals
                    '585548115243696170', // nitro
                    '780086229207220255', // DSC
                    '769726185198059540', // trailblazer
                    '760887215118614659', // mw s6
                    '737478676735721573', // mw s5
                    '720649008531374092', // mw s4
                    '717603946952130561', // damascus
                    '702535488095125606', // tiger woods
                    '643358780553428992', // undying
                    '612481505482244097', // mmxix
                    '580279000115707914', // iron burden
                    '663509082522779671', // fashion crawl '20
                    '579902430331011072', // fashion crawl 19
                    '721581377367310336', // d2 s11
                    '698358436580163605', // d2 s10
                    '654449509421678632', // d2 s9
                    '628794671069528064', // d2 s8
                    '534919307784618015', // d2 s7
                    '552534486894772239', // d2 s6
                    '536913425503092736', // d2 s5
                    '698345563485372497', // guardian
                    '534925628680437783', // lfg
                    '539645535754256387', // comp
                    '694647773060136981', // fng
                    '724980000557629592', // lumbridge
                    '535149630628036621'];// bots

    var rolesField = [`@everyone`];
    var countField = [`${guild.memberCount}`];

    for (var i = 0; i < roles.length; i++)
    {
        let role = guild.roles.cache.find(r => r.id === roles[i]);

        rolesField.push(`<@&${roles[i]}>`);
        countField.push(`${role.members.array().length}`);
    }

    rolesField.join('\n');
    countField.join('\n');

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