const { WebhookClient, ChannelType } = require('discord.js');

const { WEBHOOK_DM_ID, WEBHOOK_DM_TOKEN } = process.env;
const hahaDM = new WebhookClient({ id: WEBHOOK_DM_ID, token: WEBHOOK_DM_TOKEN });

const sendLog = require('../utils/sendLog.js');
const { scheduleArchive, restoreChannel } = require('../utils/archives.js');
const { redditVideos } = require('../utils/redditVideos.js');

module.exports = {
  async execute(client, message) {
    if (message.partial) await message.fetch();

    try {
      // disable all embeds in bot log category
      if (message.channel.parentId === '664182618828308491') message.suppressEmbeds(true);

      if (message.content.includes('🦀')) message.react('🦀');
      if (message.content.includes('🤝')) message.react('🤝');
      if (message.content.includes('<:salute:719485363558809600>')) message.react('719485363558809600');

      if (message.author.bot) return;

      if (message.content === 'b') message.channel.send('b');

      if (message.content === 'thanks son') {
        if (message.author.username === 'yungando') {
          message.channel.send('thanks dad');
        } else {
          message.channel.send('im calling the police');
        }

        sendLog(client, message.content, message.author, message.guild);
      }

      // schedule archive game channel
      if (message.channel.parentId === '785540936457125888') scheduleArchive(client, message.channel);

      // restore game channel
      if (message.channel.parentId === '917120901584150589') restoreChannel(client, message.channel);

      // Reddit Videos
      const [redditURLMatch] = message.content.match(/[^\s]*?(reddit\.com|v\.redd\.it)[^\s]*/i) || [];
      if (redditURLMatch) redditVideos(client, message, redditURLMatch);

      // dm webhook
      if (message.channel.type === ChannelType.DM) {
        const messageContent = message.content || ' ';

        if (message.attachments.size > 0) {
          hahaDM.send({
            content: messageContent,
            username: `${message.author.username} - ${message.author.id}`,
            avatarURL: message.author.displayAvatarURL({ extension: 'png' }),
            files: message.attachments,
          });
        } else {
          hahaDM.send({
            content: messageContent,
            username: `${message.author.username} - ${message.author.id}`,
            avatarURL: message.author.displayAvatarURL({ extension: 'png' }),
          });
        }
      }
    } catch (error) {
      sendLog(client, error.toString(), client.user);
    }
  },
};
