const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{
    var [quoteID, ...intro] = args;

    var announcements = message.guild.channels.cache.get('546033585530863628');

    if (message.author.tag != 'ando#0404')
    {
        message.channel.send('**You do not have the correct permissions**')
                    .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    if (quoteID == 'test')
    {
        announcements = message.guild.channels.cache.get('781940851332874240');

        var [quoteID, ...intro] = intro;
    }
    else if (isNaN(quoteID))
    {
        message.channel.send('**Please supply a valid message ID to announce**')
                       .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();
        
        return;
    }
    
    async function findMessage(message, quoteID)
    {
        let channels = message.guild.channels.cache.filter(c => (c.type == 'text' || c.type == 'news' )).array();

        for (let current of channels)
        {
          let target = await current.messages.fetch(quoteID).catch((e) => { });
          if (target) return target;
        }
    }

    function getAttach(quote)
    {
        if (quote.attachments.size > 0)
        {
            return quote.attachments.first().url;
        }
        else
        {
            return '';
        }
    }

    function getDisplayName(request, quote)
    {
        var displayName;

        try 
        {
            let quotee = request.guild.members.cache.get(quote.author.id);

            displayName = quotee.displayName;
        }
        catch
        {
            displayName = quote.author.username;
        }
        finally
        {
            return displayName;
        }
    }

    function getColour(request, quote)
    {
        var colour = '#000000';

        try
        {
            let quotee = request.guild.members.cache.get(quote.author.id);

            colour = quotee.displayHexColor;
        }
        finally
        {
            if (colour == '#000000') {
                colour = '#99aab5';
            }

            return colour;
        }
    }
    
    function createEmbed(request, quote)
    {
        if (intro[0] == '-')
        {
            intro.shift();
        }

        intro = intro.join(' ');

        const embed = new Discord.MessageEmbed()
        .setAuthor(getDisplayName(request, quote), quote.author.displayAvatarURL({ format: "png", dynamic: true }), quote.url)
        .setColor(getColour(request, quote))
        .setDescription(quote.content)
        .setFooter(`#announcements`)
        .setTimestamp(request.createdTimestamp)
        .setImage(getAttach(quote));

        announcements.send(`${intro}`, {embed: embed});
    }

    findMessage(message, quoteID)
        .then(m => {
            createEmbed(message, m);
        })
        .catch(error => message.channel.send('**Please supply a valid message ID to announce**')
                                        .then( msg => msg.delete({ timeout: 10000 }))
    )

    message.delete();
}