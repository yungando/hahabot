const Discord = require('discord.js');

const { hahaLOGID, hahaLOGToken } = require('../webhooks.json');
const hahaLOG = new Discord.WebhookClient({ id: hahaLOGID, token: hahaLOGToken });

const sendLog = (client, content, user, guild) => {
  let username = `${user.tag} - ${user.id}`;
  const displayPic = user.displayAvatarURL({ format: 'png', dynamic: true });

  if (user === client.user) {
    username = 'hahabot';
  }

  if (guild) {
    if (guild.members.cache.has((m) => m.id === user.id)) {
      const memberToLog = guild.members.cache.find((member) => member.id === user.id);

      if (memberToLog.nickname) {
        const displayName = memberToLog.nickname;

        username = `${displayName} - ${user.tag} - ${user.id}`;

        const displayLength = username.length - 80;

        if (displayLength > 0) {
          username = `${displayName.toString().slice(0, (displayName.length - displayLength - 1))}… - ${user.tag} - ${user.id}`;
        }
      }
    }
  }

  hahaLOG.send({
    content: content.toString().slice(0, 2000),
    username,
    avatarURL: displayPic,
  });
};

module.exports = sendLog;
