exports.run = (client, message, args, tools) =>
{    
    var guilds = client.guilds.cache.array();

    for (var i = 0; i < guilds.length; i++)
    {
        message.channel.send(`${guilds[i].name} - ${guilds[i].id}`);
    }

    message.channel.send('finished');
    
    message.delete();
}