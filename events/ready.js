const { guildId } = require('../config.json');
const sendLog = require("../utils/sendLog.js");
const sortCategory = require("../utils/sortCategory.js");

module.exports =
{
    once: true,
    async execute(client)
    {
        try
        {
            console.log('Started setting command permissions.');

            //await client.guilds.cache.get(guildId)?.commands.fetch()
            await client.application.commands.fetch()
                .then(appCommands => 
                {
                    for (var appCommand of appCommands)
                    {
                        appCommand = appCommand[1];

                        if (appCommand.defaultPermission == false)
                        {
                            var permissions = [];

                            if (appCommand.type != 'CHAT_INPUT')
                            {
                                permissions = client.contextMenus.find(contextMenu => contextMenu.name == appCommand.name).permissions;

                                appCommand.permissions.set({ guild: '534915212760055819', permissions: permissions });
                            }
                            else
                            {
                                permissions = client.commands.find(command => command.name == appCommand.name).permissions;

                                appCommand.permissions.set({ guild: '534915212760055819', permissions: permissions });
                            }
                        }
                    }
                });
            
            console.log('Successfully set command permissions.');
        }
        catch (error)
        {
            console.log(error);
        }

        console.log('ready');
        sendLog(client, 'ready', client.user);

        var pollo = client.guilds.cache.find(guild => guild.id == '534915212760055819'); // pollo
        var gameChannels = pollo.channels.cache.filter(channel => channel.parentId === '785540936457125888');
        var archivedCategory = pollo.channels.cache.find(channel => channel.id === '917120901584150589');

        var now = new Date();

        gameChannels.forEach(channel =>
        {
            channel.messages.fetch().then((messages) =>
            {
                if (((1000 * 60 * 60 * 24 * 21) + channel.lastMessage.createdTimestamp - now.getTime()) < 0)
                {
                    channel.setParent(archivedCategory, { lockPermissions: true })
                        .then(() =>
                        {
                            sortCategory(archivedCategory);
                        });
                }
                else
                {
                    let timeout = setTimeout(function()
                    {
                        channel.setParent(archivedCategory, { lockPermissions: true })
                            .then(() =>
                            {
                                sortCategory(archivedCategory);
                            });
                    },
                    ((1000 * 60 * 60 * 24 * 21) + channel.lastMessage.createdTimestamp - now.getTime()));

                    client.archiveTimers.set(`${channel.id}`, timeout);
                }
            })
        });
    }
};