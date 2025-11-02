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
        const leaveMessages = await member.guild.channels.fetch(channelId);

        if (leaveMessages === null) {
          await servers.delete(`${member.guild.id}.leaveMessagesID`);

          return;
        }

        const now = new Date();

        const desc = [
          `• Profile: <@${member.user.id}>`,
          `• Joined: <t:${Math.round(member.joinedTimestamp / 1000)}:F> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`,
          `• Left: <t:${Math.round(now.getTime() / 1000)}:F> (<t:${Math.round(now.getTime() / 1000)}:R>)`,
        ];

        const sortedMemberRoles = member.roles.cache.sorted((roleA, roleB) => (
          roleB.rawPosition - roleA.rawPosition
        ));

        const roleTagArray = sortedMemberRoles.filter((role) => role.name !== '@everyone').map((role) => `<@&${role.id}>`);

        if (roleTagArray.length !== 0) {
          desc.push(`• Roles: ${roleTagArray.join(' ')}`);
        }

        const notification = new EmbedBuilder()
          .setAuthor({ name: `${member.user.username} (${member.user.id})`, iconURL: member.user.displayAvatarURL({ extension: 'png' }) })
          .setColor('#2f3136')
          .setDescription(desc.join('\n'))
          .setFooter({ text: 'User left' })
          .setTimestamp(now);

        leaveMessages.send({ embeds: [notification] });
      }
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: `Failed attempting to send 'User Left' notification for <@${member.id} in ${member.guild.name}`,
        error,
        user: member.user,
        guild: member.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
