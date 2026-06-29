import { userMention } from 'discord.js';
import { getMemberLogId } from '../utils/constants.js';
import sendLog from '../utils/send-log.js';

export default {
  async execute(client, oldMember, newMember) {
    try {
      if (oldMember.partial) await oldMember.fetch();
      if (newMember.partial) await newMember.fetch();

      const memberLogId = getMemberLogId(oldMember.guild.id);
      if (!memberLogId) return;

      const memberLog = await oldMember.guild.channels.fetch(memberLogId);
      if (!memberLog) return;

      if (oldMember.premiumSince && !newMember.premiumSince) {
        memberLog.send(`${userMention(newMember.id)} unboosted the server.`);
      }
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: `Failed attempting to send 'User Updated' notification for ${userMention(oldMember.id)} in ${oldMember.guild.name}`,
        error,
        user: oldMember.user,
        guild: oldMember.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
