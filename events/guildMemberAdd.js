import { EmbedBuilder } from 'discord.js';
import { QuickDB } from 'quick.db';
import sendLog from '../utils/send-log.js';

const db = new QuickDB();
const servers = db.table('servers');

export default {
  async execute(client, member) {
    try {
      if (member.partial) await member.fetch();

      const channelId = await servers.get(`${member.guild.id}.joinMessagesID`);

      if (channelId !== null) {
        const joinMessages = await member.guild.channels.fetch(channelId);

        if (joinMessages === null) {
          await servers.delete(`${member.guild.id}.joinMessagesID`);

          return;
        }

        const desc = [
          `• Profile: <@${member.user.id}>`,
          `• Created: <t:${Math.round(member.user.createdTimestamp / 1000)}:F> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`,
          `• Joined: <t:${Math.round(member.joinedTimestamp / 1000)}:F> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`,
        ];

        const notification = new EmbedBuilder()
          .setAuthor({ name: `${member.user.username} (${member.user.id})`, iconURL: member.user.displayAvatarURL({ extension: 'png' }) })
          .setColor('#4cff4c')
          .setDescription(desc.join('\n'))
          .setFooter({ text: 'User joined' })
          .setTimestamp(new Date());

        joinMessages.send({ embeds: [notification] });
      }
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: `Failed attempting to send 'User Joined' notification for <@${member.id} in ${member.guild.name}`,
        error,
        user: member.user,
        guild: member.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
