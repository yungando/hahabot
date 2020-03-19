exports.run = (client, message, args, tools) =>
{

    var fullTag = false;

    var [dmUserTag, ...restArgs] = args;
    var attemptTag = [dmUserTag];
    var dmUser;

    if (client.users.cache.some(u => u.id === dmUserTag))
    {
        dmUser = client.users.cache.find(u => u.id === dmUserTag);
    }
    else
    {
        while (!fullTag)
        {
            if (dmUserTag.includes('#'))
            {
                fullTag = true;
            }
            else
            {
                attemptTag.push(restArgs.shift());
                dmUserTag = attemptTag.join(' ');
                attemptTag = [dmUserTag];
            }
        }
        
        var dmMessage = restArgs.join(' ');
    
        dmUser = client.users.cache.find(t => t.tag === dmUserTag);
    }

    if (message.author.tag == 'ando#0404')
    {
        if (message.attachments.size > 0)
        {
            dmUser.send(dmMessage, { files: [message.attachments.first().url] });

            console.log(`dm\'d ${dmUserTag}`);
        }
        else
        {
            dmUser.send(dmMessage);

            console.log(`dm\'d ${dmUserTag}`);
        }
    }
};