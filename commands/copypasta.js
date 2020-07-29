const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{
    var copypasta = args.join(' ');
    
    let id = '560533863290372097';
    let hahaGuild = message.guild.members.cache.get(id);
    let hahaClient = client.users.cache.get(id);

    let color = hahaGuild.displayHexColor;
    if (color == '#000000')
    {
        color = '#99aab5';
    }

    const embed = new Discord.MessageEmbed()
    .setAuthor(hahaGuild.displayName, hahaClient.displayAvatarURL({ format: "png", dynamic: true }))
    .setColor(color)
    .setDescription(copypasta)
    .setFooter('~copypasta')
    .setTimestamp(message.createdTimestamp);
    
    message.channel.send(embed);

    message.delete();
};