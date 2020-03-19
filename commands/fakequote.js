const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{
    var [ignore, ...restArgs] = args;
    var fakequote = restArgs.join(' ');

    if (message.author.tag != 'ando#0404')
    {
        message.channel.send('no').then(msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    var quoteeUser = message.mentions.users.first();
    var quoteeGuildMember = message.mentions.members.first();
   
    let color = quoteeGuildMember.displayHexColor;
    
    if (color == '#000000')
    {
        color = '#99aab5';
    }

    const embed = new Discord.MessageEmbed()
    .setAuthor(quoteeGuildMember.displayName, quoteeUser.avatarURL({ format: "png", dynamic: true }), 'https://www.youtube.com/watch?v=6n3pFFPSlW4')
    .setColor(color)
    .setDescription(fakequote)
    .setFooter(`in #${message.channel.name}`)
    .setTimestamp(message.createdTimestamp);

    message.channel.send(embed);

    message.delete();
};