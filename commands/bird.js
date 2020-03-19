exports.run = (client, message, args, tools) =>
{

    var [dmUserID, ...restArgs] = args;
    var dmUser = client.cache.find(t => t.id === dmUserID);

    var birdGuild = client.guilds.cache.get('568227296767639552');
    var birdChannel = birdGuild.channels.cache.get('569081839134965771');
    
    if (message.author.tag === 'ando#0404')
    {
        birdChannel.messages.fetch('580113520562012239')
            .then(birdmsg =>
            {
                var bird = birdmsg.content;

                dmUser.send(bird);
                dmUser.send('Would a bot send you that');
                dmUser.send('?');
            })
            .catch((e) => { console.error(e) });
    }
    
    message.delete();
};