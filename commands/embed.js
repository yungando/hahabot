const Discord = require('discord.js');

exports.run = async (client, message, args, tools) =>
{
    args = args.join(' ').split(' // ');
    var plainArgs = message.cleanContent.split(/ +/);

    plainArgs.shift();

    plainArgs = plainArgs.join(' ').split(' // ');

    var title = plainArgs[0];
    var desc = args[1];

    let id = '560533863290372097';
    let hahaGuild = message.guild.members.cache.get(id);
    let hahaClient = client.users.cache.get(id);

    let color = hahaGuild.displayHexColor;
    if (color == '#000000')
    {
        color = '#99aab5';
    }

    const embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setColor(color)
            .setDescription(desc);

    message.channel.send(embed);

    message.delete();
}