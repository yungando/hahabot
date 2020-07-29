const Discord = require('discord.js');
const { wishes, niobe } = require('../webhooks/galleries.json');

exports.run = (client, message, args, tools) =>
{
    var [gallery, ...restargs] = args;
    var footer;

    if (message.channel.id != '534930722759245825' && message.channel.id != '626559189296349234' && message.channel.id != '579882323995262976')
    {
        if (message.guild.id == '534915212760055819')
        {
            message.channel.send('**Please use the `~guide` commands in <#534930722759245825>**')
            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }
    }

    if (gallery == 'wishes' || gallery == 'wish')
    {
        gallery = wishes;
        footer = 'wishes';
    }
    else if (gallery == 'niobe' || gallery == 'niobelabs')
    {
        gallery = niobe;
        footer = 'niobe';
    }
    else
    {
        message.channel.send('**Please provide a valid gallery name.**')
                       .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    var id = '560533863290372097';
    var hahaGuild = message.guild.members.cache.get(id);
    var hahaClient = client.users.cache.get(id);

    var color = hahaGuild.displayHexColor;

    var page = 1;
    
    var input = parseInt(restargs.join(''));

    if (!isNaN(input))
    {
        if (0 < input < 15)
        {
            page = input;
        }    
    }
    
    if (color == '#000000')
    {
        color = '#99aab5';
    }

    const embed = new Discord.MessageEmbed()
    .setAuthor(hahaGuild.displayName, hahaClient.displayAvatarURL({ format: "png", dynamic: true }))
    .setColor(color)
    .setDescription(gallery[page-1][0])
    .setImage(gallery[page-1][1])
    .setFooter(`~guide ${footer} (${page}/${gallery.length})`);
    
    message.channel.send(embed)
                    .then(function (message) {
                            message.react('⬅')
                    .then(() => 
                            message.react('➡'))
                                            });

    message.delete();
}