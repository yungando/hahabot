const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{    
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
    .setFooter('~runaway')
    .setTimestamp(message.createdTimestamp)
    .setImage('https://cdn.discordapp.com/attachments/569081839134965771/594880322018213888/runaway480.gif');

    message.channel.send(embed);

    message.delete();
};