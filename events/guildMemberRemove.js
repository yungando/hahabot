import { EmbedBuilder, roleMention, userMention } from 'discord.js';
import { getMemberLogId } from '../utils/constants.js';
import sendLog from '../utils/send-log.js';
import { fullTimestamp, relativeTimestamp } from '../utils/text.js';

export default {
  async execute(client, member) {
    try {
      const memberLogId = getMemberLogId(member.guild.id);
      if (!memberLogId) return;

      const memberLog = await member.guild.channels.fetch(memberLogId);
      if (!memberLog) return;

      const now = new Date();

      const desc = [
        `• Profile: ${userMention(member.user.id)}`,
        `• Joined: ${fullTimestamp(member.joinedTimestamp)} (${relativeTimestamp(member.joinedTimestamp)})`,
        `• Left: ${fullTimestamp(now.getTime())} (${relativeTimestamp(now.getTime())})`,
      ];

      const sortedMemberRoles = member.roles.cache.sorted((roleA, roleB) => (
        roleB.rawPosition - roleA.rawPosition
      ));

      const roleTagArray = sortedMemberRoles.filter((role) => role.name !== '@everyone').map((role) => `${roleMention(role.id)}`);

      if (roleTagArray.length !== 0) {
        desc.push(`• Roles: ${roleTagArray.join(' ')}`);
      }

      const notification = new EmbedBuilder()
        .setAuthor({ name: `${member.user.username} (${member.user.id})`, iconURL: member.user.displayAvatarURL({ extension: 'png' }) })
        .setColor('#2f3136')
        .setDescription(desc.join('\n'))
        .setFooter({ text: 'User left' })
        .setTimestamp(now);

      memberLog.send({ embeds: [notification] });
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: `Failed attempting to send 'User Left' notification for ${userMention(member.id)} in ${member.guild.name}`,
        error,
        guild: member.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
