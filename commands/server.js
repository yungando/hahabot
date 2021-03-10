const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args, tools) =>
{
    var servers = new db.table('servers');
    var serverID = message.guild.id;

    var [setting, input, ...restArgs] = args;
    setting = setting.toLowerCase();

    if (!message.member.permissions.has('MANAGE_GUILD'))
    {
        message.channel.send('**You do not have permission to adjust settings in this server.**')
                        .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    if (setting == 'joinmessages')
    {
        if (input == 'on')
        {
            var  [channelID, ...restArgs] = restArgs;

            if (channelID == null)
            {
                channelID = message.channel.id;
            }

            if ((isNaN(channelID)) || (!message.guild.channels.cache.some(c => c.id == channelID)))
            {
                message.channel.send('**Channel ID input invalid**')
                        .then( msg => msg.delete({ timeout: 10000 }));
            }

            servers.set(`${serverID}.serverID`, `${serverID}`);
            servers.set(`${serverID}.joinMessagesID`, `${channelID}`);

            message.channel.send(`User join messages **enabled** in \`#${message.guild.channels.cache.find(c => c.id == channelID).name}\``)
                            .then( msg => msg.delete({ timeout: 10000 }));
        }
        else if (input == 'off')
        {
            servers.set(`${serverID}.serverID`, `${serverID}`);
            servers.delete(`${serverID}.joinMessagesID`);

            message.channel.send(`User join messages **disabled**`);
        }
        else if (input == 'get')
        {
            var channelID = servers.get(`${serverID}.joinMessagesID`);

            if (channelID == null)
            {
                message.channel.send(`User join messages **disabled**`);
            }
            else
            {
                message.channel.send(`User join messages **enabled** in \`#${message.guild.channels.cache.find(c => c.id == channelID).name}\``)
                                .then( msg => msg.delete({ timeout: 10000 }));
            }
        }
        else
        {
            message.channel.send('**Invalid join messages input**')
                        .then( msg => msg.delete({ timeout: 10000 }));
        }

    }
    else if (setting == 'leavemessages')
    {
        if (input == 'on')
        {
            var  [channelID, ...restArgs] = restArgs;

            if (channelID == null)
            {
                channelID = message.channel.id;
            }

            if ((isNaN(channelID)) || (!message.guild.channels.cache.some(c => c.id == channelID)))
            {
                message.channel.send('**Channel ID input invalid**')
                        .then( msg => msg.delete({ timeout: 10000 }));
            }

            servers.set(`${serverID}.serverID`, `${serverID}`);
            servers.set(`${serverID}.leaveMessagesID`, `${channelID}`);

            message.channel.send(`User leave messages **enabled** in \`#${message.guild.channels.cache.find(c => c.id == channelID).name}\``)
                            .then( msg => msg.delete({ timeout: 10000 }));
        }
        else if (input == 'off')
        {
            servers.set(`${serverID}.serverID`, `${serverID}`);
            servers.delete(`${serverID}.leaveMessagesID`);

            message.channel.send(`User leave messages **disabled**`);
        }
        else if (input == 'get')
        {
            var channelID = servers.get(`${serverID}.leaveMessagesID`);

            if (channelID == null)
            {
                message.channel.send(`User leave messages **disabled**`);
            }
            else
            {
                message.channel.send(`User leave messages **enabled** in \`#${message.guild.channels.cache.find(c => c.id == channelID).name}\``)
                                .then( msg => msg.delete({ timeout: 10000 }));
            }
        }
        else
        {
            message.channel.send('**Invalid leave messages input**')
                        .then( msg => msg.delete({ timeout: 10000 }));
        }
    }
    else
    {
        message.channel.send('**Invalid server setting input**')
                        .then( msg => msg.delete({ timeout: 10000 }));
    }

    message.delete();
}