const { WebhookClient, MessageAttachment } = require('discord.js');

const FfmpegCommand = require('fluent-ffmpeg');
const fs = require('node:fs');
const fetch = require('node-fetch');

const { clientId, clientSecret, refreshToken } = require('../redditConfig.json');
const Snoowrap = require('snoowrap');

const { hahaDMID, hahaDMToken } = require('../webhooks.json');
const hahaDM = new WebhookClient({ id: hahaDMID, token: hahaDMToken });

const sendLog = require('../utils/sendLog.js');
const sortCategory = require('../utils/sortCategory.js');

const getRedditPostID = (redditURL) => {
  const { pathname } = URL.parse(redditURL);

  const [postId] = pathname.split('comments/')[1].split('/');

  return postId;
};

const getAudioURL = async (mediaId) => {
  const bitrateArray = ['256', '128', '64'];

  for (const bitrate of bitrateArray) {
    const testUrl = await fetch(`https://v.redd.it/${mediaId}/DASH_AUDIO_${bitrate}.mp4`);
    if (testUrl.ok) return testUrl.url;
  }

  const baseUrl = await fetch(`https://v.redd.it/${mediaId}/DASH_audio.mp4`);
  if (baseUrl.ok) return baseUrl.url;

  return null;
};

module.exports = {
  async execute(client, message) {
    if (message.partial) await message.fetch();

    try {
      if (message.content.includes('🦀')) {
        message.react('🦀');
      }

      if (message.content.includes('<a:crabrave:586918323149602816>')) {
        message.react('586918323149602816');
      }

      if (message.author.bot) return; // ///////////////////////////////////////////////////

      if (message.content === 'b') {
        message.channel.send('b');
      }

      if (message.content === 'thanks son') {
        if (message.author.tag === 'ando#0404') {
          message.channel.send('thanks dad');
        } else {
          message.channel.send('im calling the police');
        }

        sendLog(client, message.content, message.author, message.guild);
      }

      // auto-archive game threads
      if (message.channel.parentId === '785540936457125888') {
        clearTimeout(client.archiveTimers.get(`${message.channel.id}`));

        const timeout = setTimeout(
          () => {
            const archivedCategory = message.guild.channels.cache.find((channel) => channel.id === '917120901584150589');

            message.channel.setParent(archivedCategory, { lockPermissions: true })
              .then(() => {
                sortCategory(archivedCategory);
              });
          },
          (1000 * 60 * 60 * 24 * 21),
        );

        client.archiveTimers.set(`${message.channel.id}`, timeout);
      }

      // un-archive game threads
      if (message.channel.parentId === '917120901584150589') {
        const gamesCategory = message.guild.channels.cache.find((channel) => channel.id === '785540936457125888');

        message.channel.setParent(gamesCategory, { lockPermissions: true })
          .then(() => {
            sortCategory(gamesCategory);
          });

        const timeout = setTimeout(
          () => {
            const archivedCategory = message.guild.channels.cache.find((channel) => channel.id === '917120901584150589');

            message.channel.setParent(archivedCategory, { lockPermissions: true })
              .then(() => {
                sortCategory(archivedCategory);
              });
          },
          (1000 * 60 * 60 * 24 * 21),
        );

        client.archiveTimers.set(`${message.channel.id}`, timeout);
      }

      // dm webhook
      if (message.channel.type === 'DM') {
        let messageContent = message.content;

        if (messageContent === '') {
          messageContent = ' ';
        }

        if (message.attachments.size > 0) {
          hahaDM.send({
            content: messageContent,
            username: `${message.author.tag} - ${message.author.id}`,
            avatarURL: message.author.displayAvatarURL({ format: 'png', dynamic: true }),
            files: message.attachments,
          });
        } else {
          hahaDM.send({
            content: messageContent,
            username: `${message.author.tag} - ${message.author.id}`,
            avatarURL: message.author.displayAvatarURL({ format: 'png', dynamic: true }),
          });
        }
      }

      // Reddit Videos
      if (message.content.includes('reddit.com')) {
        message.channel.sendTyping();

        try {
          const reddit = new Snoowrap({
            userAgent: 'hahabot by u/couldie',
            clientId,
            clientSecret,
            refreshToken,
          });

          const words = message.content.split(/ +/);
          const redditPostId = getRedditPostID(words.find((word) => word.includes('reddit.com')));

          const redditPostData = (await reddit.getSubmission(redditPostId).fetch()).toJSON();

          if (!redditPostData.is_video) return;

          if (!redditPostData.secure_media?.reddit_video) {
            if (redditPostData.url) {
              if (redditPostData.domain === 'imgur.com') {
                if (message.channel.type === 'GUILD_TEXT') message.suppressEmbeds(true);

                const videoURLArray = redditPostData.url.split('.');

                videoURLArray.pop();

                message.reply(`${videoURLArray.join('.')}.mp4`);
              }
            }
            return;
          }

          const [videoURL] = redditPostData.secure_media.reddit_video.fallback_url.split('?');
          const [mediaId] = videoURL.split('https://v.redd.it/')[1].split('/');

          const dir = './redditvideos';

          if (!fs.existsSync(dir)) fs.mkdirSync(dir);

          const ffmpegCommand = new FfmpegCommand();
          ffmpegCommand.addInput(videoURL);

          const audioURL = await getAudioURL(mediaId);
          if (audioURL) ffmpegCommand.addInput(audioURL);

          ffmpegCommand.output(`${dir}/${mediaId}.mp4`)
            .on('err', (err) => {
              fs.unlink(`${dir}/${mediaId}.mp4`, (fsErr) => {
                if (fsErr) throw fsErr;
              });

              sendLog(client, err, client.user);
            })
            .on('end', () => {
              const attachment = new MessageAttachment(`${dir}/${mediaId}.mp4`, `${mediaId}.mp4`);

              message.reply({ files: [attachment] })
                .then(() => {
                  if (message.channel.type === 'GUILD_TEXT') message.suppressEmbeds(true);

                  fs.unlink(`${dir}/${mediaId}.mp4`, (err) => {
                    if (err) throw err;
                  });
                });
            })
            .run();
        } catch (error) {
          sendLog(client, error, client.user);
        }
      }
    } catch (error) {
      sendLog(client, error.toString(), client.user);
    }
  },
};
