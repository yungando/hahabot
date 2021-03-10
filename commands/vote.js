exports.run = (client, message, args, tools) =>
{
    var [messageID] = args;

    if (messageID == '^')
    {
        message.channel.messages.fetch({before: message.id, limit: 1}).then(messages =>
            messages.array()[0].react('594816363722309645')
                    .then(() => messages.array()[0].react('594816363533565991')))
                    .catch((e) => { });
    }
    else if (isNaN(messageID))
    {
        message.channel.send('**Could not react. Message ID was incorrect.**')
                       .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }
    else
    {
        async function findMessage(message, messageID)
        {
            let channels = message.guild.channels.cache.filter(c => (c.type == 'text' || c.type == 'news' )).array();

            for (let current of channels)
            {
              let target = await current.messages.fetch(messageID).catch((e) => { });
              if (target) return target;
            }
        }
    
        findMessage(message, messageID)
            .then(function (message) {
                message.react('594816363722309645')
            .then(() => 
                message.react('594816363533565991'))
                })
            .catch(error => message.channel.send('**Could not react. Message ID was incorrect.**')
                                            .then( msg => msg.delete({ timeout: 10000 }))
        )
    }
    
    message.delete();
}