const Discord = require('discord.js');

const { hahaLOGID, hahaLOGToken } = require('../webhooks.json');
const hahaLOG = new Discord.WebhookClient({ id: hahaLOGID, token: hahaLOGToken });

const sendLog = (client, content, user, guild) =>
{
    var username = `${user.tag} - ${user.id}`;
    var displayPic = user.displayAvatarURL({ format: "png", dynamic: true });

    if (user == client.user)
    {
        username = 'hahabot';
    }

    if (guild)
    {
        if (guild.members.cache.has(m => m.id == user.id))
        {
            var member = guild.members.cache.find(member => member.id == user.id);
    
            if (member.nickname)
            {
                var displayName = member.nickname;
                
                username = `${displayName} - ${user.tag} - ${user.id}`;
                
                var displayLength = username.length - 80;
    
                if (displayLength > 0)
                {
                    username = `${displayName.toString().slice(0, (displayName.length - displayLength - 1))}… - ${user.tag} - ${user.id}`;
                }
            }
        }
    }

    hahaLOG.send({
        content: content.toString().slice(0, 2000),
        username: username,
        avatarURL: displayPic
    });
}

module.exports = sendLog;