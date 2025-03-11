const { AttachmentBuilder, ChannelType } = require('discord.js');

const FfmpegCommand = require('fluent-ffmpeg');
const fs = require('node:fs');
const fetch = require('node-fetch');

const { clientId, clientSecret, refreshToken } = require('../redditConfig.json');
const Snoowrap = require('snoowrap');

const sendLog = require('./sendLog.js');

const getRedditPostID = (redditURL) => {
  const { pathname } = URL.parse(redditURL);

  const [postId] = pathname.split('comments/')[1].split('/');

  return postId;
};

const getAudioMetadata = async (mediaId) => {
  const bitrateArray = ['256', '128', '64'];

  for (const bitrate of bitrateArray) {
    const testUrl = await fetch(`https://v.redd.it/${mediaId}/DASH_AUDIO_${bitrate}.mp4`);

    if (testUrl.ok) {
      const size = parseInt(testUrl.headers.get('content-length'), 10);
      const { url } = testUrl;
      return { url, size };
    }
  }

  const baseUrl = await fetch(`https://v.redd.it/${mediaId}/DASH_audio.mp4`);

  if (baseUrl.ok) {
    const size = parseInt(baseUrl.headers.get('content-length'), 10);
    const { url } = baseUrl;
    return { url, size };
  }

  return { url: '', size: 0 };
};

const getVideoUrl = async (mediaId, audioFileSize) => {
  const resolutionArray = ['1080', '720', '480', '360', '240', '140', '120'];
  const fileSizeLimitInBytes = 10000000;

  for (const resolution of resolutionArray) {
    const testUrl = await fetch(`https://v.redd.it/${mediaId}/DASH_${resolution}.mp4`);

    if (testUrl.ok) {
      const videoFileSize = parseInt(testUrl.headers.get('content-length'), 10);
      const { url } = testUrl;
      if ((videoFileSize + audioFileSize) <= fileSizeLimitInBytes) return url;
    }
  }

  return null;
};

const redditVideos = async (client, message) => {
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

    message.react('<a:dance:592076212256374784>');

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

    const [fallbackURL] = redditPostData.secure_media.reddit_video.fallback_url.split('?');
    const [mediaId] = fallbackURL.split('https://v.redd.it/')[1].split('/');

    const ffmpegCommand = new FfmpegCommand();

    const audioMetadata = await getAudioMetadata(mediaId);
    if (audioMetadata.url.length) ffmpegCommand.addInput(audioMetadata.url);

    const videoURL = await getVideoUrl(mediaId, audioMetadata.size);

    if (!videoURL) return;

    ffmpegCommand.addInput(videoURL);

    const dir = './redditvideos';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    ffmpegCommand.output(`${dir}/${mediaId}.mp4`)
      .on('err', (err) => {
        fs.unlink(`${dir}/${mediaId}.mp4`, (fsErr) => {
          if (fsErr) throw fsErr;
        });

        sendLog(client, err, client.user);
      })
      .on('end', () => {
        const attachment = new AttachmentBuilder(`${dir}/${mediaId}.mp4`, { name: `${mediaId}.mp4` });

        message.reply({ files: [attachment] })
          .then(() => {
            if (message.channel.type === ChannelType.GuildText) message.suppressEmbeds(true);

            const messageReaction = message.reactions.cache.get('<592076212256374784>');
            if (messageReaction) messageReaction.users.remove(client.user);

            fs.unlink(`${dir}/${mediaId}.mp4`, (err) => {
              if (err) throw err;
            });
          });
      })
      .run();
  } catch (error) {
    const messageReaction = message.reactions.cache.get('<592076212256374784>');
    if (messageReaction) messageReaction.users.remove(client.user);

    console.log(error);
    sendLog(client, error, client.user);
  }
};

module.exports = { redditVideos };
