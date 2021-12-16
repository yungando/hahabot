const sendLog = require("../utils/sendLog.js");

module.exports =
{
    once: true,
    async execute(client)
    {
        console.log('ready');
        sendLog(client, 'ready', client.user);

        var pollo = client.guilds.cache.find(guild => guild.id == '534915212760055819'); // pollo
        var gameChannels = pollo.channels.cache.filter(channel => channel.parentId === '785540936457125888');

        var now = new Date();

        gameChannels.forEach(channel =>
        {
            channel.messages.fetch().then((messages) =>
            {
                if (((1000 * 60 * 60 * 24 * 21) + channel.lastMessage.createdTimestamp - now.getTime()) < 0)
                {
                    channel.setParent('917120901584150589', { lockPermissions: true });}
                else
                {
                    let timeout = setTimeout(function()
                    {
                        channel.setParent('917120901584150589', { lockPermissions: true });
                    },
                    ((1000 * 60 * 60 * 24 * 21) + channel.lastMessage.createdTimestamp - now.getTime()));

                    client.archiveTimers.set(`${channel.id}`, timeout);
                }
            })
        });
    }
};