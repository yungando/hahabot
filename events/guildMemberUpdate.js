import { SERVERS } from '../config/constants.js';
import sendLog from '../utils/send-log.js';

const memberHasNitroRole = (member) => (
  member.roles.cache.some((role) => role.id === SERVERS.pollo.roles.nitro.id)
);

export default {
  async execute(client, oldMember, newMember) {
    try {
      if (oldMember.partial) await oldMember.fetch();
      if (newMember.partial) await newMember.fetch();

      const { guild } = oldMember;

      if (guild.id !== SERVERS.pollo.id) return;

      if (memberHasNitroRole(oldMember) && !memberHasNitroRole(newMember)) {
        guild.systemChannel.send(`<@${newMember.id}> unboosted the server.`);
      }
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: `Failed attempting to send 'User Updated' notification for <@${oldMember.id} in ${oldMember.guild.name}`,
        error,
        user: oldMember.user,
        guild: oldMember.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
