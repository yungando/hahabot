import { EmbedBuilder, userMention } from 'discord.js';
import { getMemberLogId } from '../utils/constants.js';
import sendLog from '../utils/send-log.js';
import { fullTimestamp, relativeTimestamp } from '../utils/text.js';

export default {
  async execute(client, member) {
    try {
      if (member.partial) await member.fetch();

      const memberLogId = getMemberLogId(member.guild.id);
      if (!memberLogId) return;

      const memberLog = await member.guild.channels.fetch(memberLogId);
      if (!memberLog) return;

      const desc = [
        `• Profile: ${userMention(member.user.id)}`,
        `• Created: ${fullTimestamp(member.user.createdTimestamp)} (${relativeTimestamp(member.user.createdTimestamp)})`,
        `• Joined: ${fullTimestamp(member.joinedTimestamp)} (${relativeTimestamp(member.joinedTimestamp)})`,
      ];

      const notification = new EmbedBuilder()
        .setAuthor({ name: `${member.user.username} (${member.user.id})`, iconURL: member.user.displayAvatarURL({ extension: 'png' }) })
        .setColor('#4cff4c')
        .setDescription(desc.join('\n'))
        .setFooter({ text: 'User joined' })
        .setTimestamp(new Date());

      memberLog.send({ embeds: [notification] });
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: `Failed attempting to send 'User Joined' notification for ${userMention(member.id)} in ${member.guild.name}`,
        error,
        user: member.user,
        guild: member.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
