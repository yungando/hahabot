import { ChannelType, WebhookClient } from 'discord.js';
import { EMOJI, SERVERS } from '../config/constants.js';
import { restoreChannel, scheduleArchive } from '../handlers/archives.js';
import handleTwitterUrl from '../handlers/twitter.js';
import sendLog from '../utils/send-log.js';

const { HAHA_WEBHOOK_DM_ID, HAHA_WEBHOOK_DM_TOKEN } = process.env;
const hahaDM = new WebhookClient({ id: HAHA_WEBHOOK_DM_ID, token: HAHA_WEBHOOK_DM_TOKEN });

export default {
  async execute(client, message) {
    try {
      if (message.partial) await message.fetch();

      if (message.content.includes('🦀')) message.react('🦀');
      if (message.content.includes('🤝')) message.react('🤝');
      if (message.content.includes(EMOJI.salute.text)) message.react(EMOJI.salute.id);

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

      if (message.channel.parentId === SERVERS.pollo.categories.games) {
        scheduleArchive(client, message.channel);
      }
      if (message.channel.parentId === SERVERS.pollo.categories.archivedGames) {
        restoreChannel(client, message.channel);
      }

      // twitter posts
      const [twitterUrlMatch] = message.content.match(/https:\/\/(twitter|x).com\/.+\/status\/.+/) || [];
      if (twitterUrlMatch) await handleTwitterUrl(client, message, twitterUrlMatch);

      // dm webhook
      if (message.channel.type === ChannelType.DM) {
        const messageContent = message.content || ' ';

        hahaDM.send({
          content: messageContent,
          username: `${message.author.username} - ${message.author.id}`,
          avatarURL: message.author.displayAvatarURL({ extension: 'png' }),
          ...(message.attachments.size > 0 && {
            files: message.attachments,
          }),
        });
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
