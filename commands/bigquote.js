const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{
    var [quoteID, ...restArgs] = args;
    
    if (message.author.tag != 'ando#0404')
    {
        message.delete();

        return;
    }

    if (isNaN(quoteID))
    {
        message.channel.send('**Please supply a valid message ID to quote**')
                       .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }
    
    async function findMessage(message, quoteID)
    {
        let channels = client.channels.cache.filter(c => (c.type == 'text' || c.type == 'news' )).array();

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

    function getQuotee(quoteeID, quote)
    {
        try
        {
            var quotee = request.guild.members.cache.get(quoteeID);
        }
        catch
        {
            var quotee = quote.guild.members.cache.get(quoteeID);
        }

        return quotee;
    }
    
    function createEmbed(request, quote)
    {
        let quotee = getQuotee(quote.author.id, quote);

        let quoteGuild = request.guild.id;
        let quoteChannel = quote.channel.id;
        let quoteMessageID = quote.id;
        let quoteColor = quotee.displayHexColor;

        if (quoteColor == '#000000') {
            quoteColor = '#99aab5';
        }
        
        if (!Array.isArray(quote.embeds) || !quote.embeds.length)
        {
            const embed = new Discord.MessageEmbed()
            .setAuthor(quotee.displayName, quote.author.displayAvatarURL({ format: "png", dynamic: true }), quote.url)
            .setColor(quoteColor)
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