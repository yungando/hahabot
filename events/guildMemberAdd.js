const { MessageEmbed } = require('discord.js');
const { QuickDB } = require('quick.db');

const db = new QuickDB();
const servers = db.table('servers');

const sendLog = require('../utils/sendLog.js');

module.exports = {
  async execute(client, member) {
    if (member.partial) await member.fetch();

    try {
      const channelId = servers.get(`${member.guild.id}.joinMessagesID`);

      if (channelId !== null) {
        const joinMessages = member.guild.channels.cache.find((c) => c.id === channelId);

        if (joinMessages === null) {
          servers.delete(`${member.guild.id}.joinMessagesID`);

          return;
        }

        const now = new Date();

        const desc = [
          `• Profile: <@${member.user.id}>`,
          `• Created: <t:${Math.round(member.user.createdTimestamp / 1000)}:F> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`,
          `• Joined: <t:${Math.round(member.joinedTimestamp / 1000)}:F> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`,
        ];

        const notification = new MessageEmbed()
          .setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ format: 'png', dynamic: true }))
          .setColor('#4cff4c')
          .setDescription(desc.join('\n'))
          .setFooter('User joined')
          .setTimestamp(now);

        joinMessages.send({ embeds: [notification] });
      }
    } catch (error) {
      sendLog(client, error, client.user);
    }
  },
};
