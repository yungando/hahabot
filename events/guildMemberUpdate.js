const sendLog = require('../utils/sendLog.js');

module.exports = {
  async execute(client, oldMember, newMember) {
    if (oldMember.partial) await oldMember.fetch();
    if (newMember.partial) await newMember.fetch();

    const polloId = '534915212760055819';
    const nitroRoleId = '585548115243696170';

    try {
      const { guild } = oldMember;

      if (guild.id !== polloId) return; // pollo

      // eslint-disable-next-line max-len
      if (oldMember.roles.cache.some((role) => role.id === nitroRoleId) && !newMember.roles.cache.some((role) => role.id === nitroRoleId)) {
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
