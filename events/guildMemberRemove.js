const { MessageEmbed } = require('discord.js');

const db = require('quick.db');
var servers = new db.table('servers');

const sendLog = require("../utils/sendLog.js");

module.exports = 
{
    async execute(client, member)
    {
        if (member.partial) await member.fetch();

        try
        {
            var channelId = servers.get(`${member.guild.id}.leaveMessagesID`);

            if (channelId != null)
            {
                var leaveMessages = member.guild.channels.cache.find(c => c.id == channelId);

                if (leaveMessages == null)
                {
                    servers.delete(`${member.guild.id}.leaveMessagesID`)

                    return;
                }

                var now = new Date();

                var desc = [    `• Profile: <@${member.user.id}>`,
                                `• Joined: <t:${Math.round(member.joinedTimestamp / 1000)}:F> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`,
                                `• Left: <t:${Math.round(now.getTime() / 1000)}:F> (<t:${Math.round(now.getTime() / 1000)}:R>)` ];

                var roles = [];

                member.roles.cache.sort((roleA, roleB) => roleB.rawPosition - roleA.rawPosition).filter(role => role.name != '@everyone').each(role => roles.push(`<@&${role.id}>`));

                if (roles.length != 0)
                {
                    desc.push(`• Roles: ${roles.join(' ')}`);
                }

                const notification = new MessageEmbed()
                    .setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ format: "png", dynamic: true }))
                    .setColor('#2f3136')
                    .setDescription(desc.join('\n'))
                    .setFooter('User left')
                    .setTimestamp(now);

                leaveMessages.send({ embeds: [notification] });
            }
        }
        catch (error)
        {
            sendLog(client, error, client.user);
        }
    }
};