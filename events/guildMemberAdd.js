const { EmbedBuilder } = require('discord.js');

const { QuickDB } = require('quick.db');
const db = new QuickDB();
const servers = db.table('servers');

const sendLog = require('../utils/sendLog.js');

module.exports = {
  async execute(client, member) {
    if (member.partial) await member.fetch();

    try {
      const channelId = await servers.get(`${member.guild.id}.joinMessagesID`);

      if (channelId !== null) {
        const joinMessages = await member.guild.channels.fetch(channelId);

        if (joinMessages === null) {
          await servers.delete(`${member.guild.id}.joinMessagesID`);

          return;
        }

        const now = new Date();

        const desc = [
          `• Profile: <@${member.user.id}>`,
          `• Created: <t:${Math.round(member.user.createdTimestamp / 1000)}:F> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`,
          `• Joined: <t:${Math.round(member.joinedTimestamp / 1000)}:F> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`];

        const notification = new EmbedBuilder()
          .setAuthor({ name: `${member.user.username} (${member.user.id})`, iconURL: member.user.displayAvatarURL({ extension: 'png' }) })
          .setColor('#4cff4c')
          .setDescription(desc.join('\n'))
          .setFooter({ text: 'User joined' })
          .setTimestamp(now);

        joinMessages.send({ embeds: [notification] });
      }
    } catch (error) {
      console.log(error);
      sendLog(client, error, client.user);
    }
  },
};
