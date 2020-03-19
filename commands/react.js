exports.run = (client, message, args, tools) =>
{
    var [messageID, emojiName] = args;

    try
    {
        var emoji = client.emojis.cache.find(t => t.name === emojiName);
    }
    catch (e)
    {
        console.log(e.messageID);
    }

    if (isNaN(messageID))
    {
        message.channel.send('**Could not react. Either the emoji name or the message ID was incorrect.**')
                       .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    async function findMessage(message, messageID)
    {
        let channels = message.guild.channels.cache.filter(c => c.type == 'text').array();
        
        for (let current of channels)
        {
          let target = await current.messages.fetch(messageID).catch((e) => { console.error(e) });
          if (target) return target;
        }
    }

    findMessage(message, messageID)
        .then(m => {
            m.react(emoji.id);
        })
        .catch(error => message.channel.send('**Could not react. Either the emoji name or the message ID was incorrect.**')
                                        .then( msg => msg.delete({ timeout: 10000 }))
    )

    message.delete();
}