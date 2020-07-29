const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{
    var [quoteID, ...restArgs] = args;

    if (isNaN(quoteID))
    {
        message.channel.send('**Please supply a valid message ID to quote**')
                       .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();
        
        return;
    }
    
    async function findMessage(message, quoteID)
    {
        let channels = message.guild.channels.cache.filter(c => c.type == 'text').array();

        for (let current of channels)
        {
          let target = await current.messages.fetch(quoteID).catch((e) => { console.error(e) });
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
        let quoteGuild = request.guild.id;
        let quoteChannel = quote.channel.id;
        let quoteMessageID = quote.id;
        
        if (!Array.isArray(quote.embeds) || !quote.embeds.length)
        {
            const embed = new Discord.MessageEmbed()
            .setAuthor(getDisplayName(request, quote), quote.author.displayAvatarURL({ format: "png", dynamic: true }), quote.url)
            .setColor(getColour(request, quote))
            .setDescription(quote.content)
            .setFooter(`in #${quote.channel.name}`)
            .setTimestamp(quote.createdTimestamp)
            .setImage(getAttach(quote));

            request.channel.send(embed);
        }
        else
        {
            let embedQuote = quote.embeds[0];

            const embedEmbed = new Discord.MessageEmbed(embedQuote)

            if (request.channel.id == '593896171291017221')
            {
                request.channel.send({embed:embedEmbed})
                               .then(function (message) {
                                    message.react('593898113626800129')
                               .then(() => 
                                    message.react('593898113639383040'))
                               .then(() => 
                                    message.edit({embed: embedEmbed.setFooter(`#raid-schedules - ${message.id}`)}))
                                                        });
            }
            else if (request.channel.id == '623530668676349957')
            {
                request.channel.send({embed:embedEmbed})
                                            .then(function (message) {
                                                    message.edit({embed: embedEmbed.setFooter(`#garden-of-salvation - ${message.id}`)})
                                                                    });
            }
            else 
            {
                request.channel.send(embedEmbed);
            }
        }
    }

    findMessage(message, quoteID)
        .then(m => {
            createEmbed(message, m);
        })
        .catch(error => message.channel.send('**Please supply a valid message ID to quote**')
                                        .then( msg => msg.delete({ timeout: 10000 }))
    )

    message.delete();
}