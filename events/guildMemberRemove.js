const { EmbedBuilder } = require('discord.js');

const { QuickDB } = require('quick.db');
const db = new QuickDB();
const servers = db.table('servers');

const sendLog = require('../utils/sendLog.js');

module.exports = {
  async execute(client, member) {
    if (member.partial) await member.fetch();

    try {
      const channelId = await servers.get(`${member.guild.id}.leaveMessagesID`);

      if (channelId !== null) {
        const leaveMessages = member.guild.channels.cache.find((c) => c.id === channelId);

        if (leaveMessages === null) {
          await servers.delete(`${member.guild.id}.leaveMessagesID`);

          return;
        }

        const now = new Date();

        const desc = [
          `• Profile: <@${member.user.id}>`,
          `• Joined: <t:${Math.round(member.joinedTimestamp / 1000)}:F> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`,
          `• Left: <t:${Math.round(now.getTime() / 1000)}:F> (<t:${Math.round(now.getTime() / 1000)}:R>)`];

        const roles = [];

        member.roles.cache.sort((roleA, roleB) => (roleB.rawPosition - roleA.rawPosition).filter((role) => role.name !== '@everyone').each((role) => roles.push(`<@&${role.id}>`)));

        if (roles.length !== 0) {
          desc.push(`• Roles: ${roles.join(' ')}`);
        }

        const notification = new EmbedBuilder()
          .setAuthor(`${member.user.username} (${member.user.id})`, member.user.displayAvatarURL({ extension: 'png' }))
          .setColor('#2f3136')
          .setDescription(desc.join('\n'))
          .setFooter('User left')
          .setTimestamp(now);

        leaveMessages.send({ embeds: [notification] });
      }
    } catch (error) {
      sendLog(client, error, client.user);
    }
  },
};
