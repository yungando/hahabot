const sendLog = require("../utils/sendLog.js");

module.exports =
{
    once: true,
    async execute(client)
    {
        console.log('ready');
        sendLog(client, 'ready', client.user);

        var pollo = client.guilds.cache.find(guild => guild.id == '568227296767639552'); // pollo
        var gameChannels = pollo.channels.cache.filter(channel => channel.parentId === '918170682943225917');

        var now = new Date();

        gameChannels.forEach(channel =>
        {
            channel.messages.fetch().then((messages) =>
            {
                if (((1000 * 60 * 60 * 24 * 21) + channel.lastMessage.createdTimestamp - now.getTime()) < 0)
                {
                    channel.setParent('918170761313783889', { lockPermissions: true });}
                else
                {
                    let timeout = setTimeout(function()
                    {
                        channel.setParent('918170761313783889', { lockPermissions: true });
                    },
                    ((1000 * 60 * 60 * 24 * 21) + channel.lastMessage.createdTimestamp - now.getTime()));

                    client.archiveTimers.set(`${channel.id}`, timeout);
                }
            })
        });
    }
};