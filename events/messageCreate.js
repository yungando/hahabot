import { ChannelType, WebhookClient } from 'discord.js';
import { QuickDB } from 'quick.db';
import { restoreChannel, scheduleArchive } from '../handlers/archives.js';
import handleRedditUrl from '../handlers/reddit.js';
import handleTwitterUrl from '../handlers/twitter.js';
import sendLog from '../utils/send-log.js';

const { HAHA_WEBHOOK_DM_ID, HAHA_WEBHOOK_DM_TOKEN } = process.env;
const hahaDM = new WebhookClient({ id: HAHA_WEBHOOK_DM_ID, token: HAHA_WEBHOOK_DM_TOKEN });
const db = new QuickDB();
const servers = db.table('servers');

export default {
  async execute(client, message) {
    try {
      if (message.partial) await message.fetch();

      if (await servers.get(`${message.guild?.id}.serverName`) !== message.guild?.name) {
        await servers.set(`${message.guild.id}.serverName`, message.guild.name);
      }

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

        const logPayload = {
          logType: 'string',
          message: message.content,
          user: message.author,
          guild: message.guild,
        };

        sendLog(client, logPayload);
      }

      // schedule archive game channel
      if (message.channel.parentId === '785540936457125888') scheduleArchive(client, message.channel);

      // restore game channel
      if (message.channel.parentId === '917120901584150589') restoreChannel(client, message.channel);

      // reddit posts
      const [redditUrlMatch] = message.content.match(/(?:https?:\/\/)?(?:[^\s/]+\.)?(?:reddit\.com|v\.redd\.it)\S*/gi) || [];
      if (redditUrlMatch) await handleRedditUrl(client, message, redditUrlMatch);

      // twitter posts
      const [twitterUrlMatch] = message.content.match(/https:\/\/(twitter|x).com\/.+\/status\/.+/) || [];
      if (twitterUrlMatch) await handleTwitterUrl(client, message, twitterUrlMatch);

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
      const errorPayload = {
        logType: 'error',
        message,
        error,
        user: message.author,
        guild: message.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
