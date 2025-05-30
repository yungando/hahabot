const { AttachmentBuilder, ChannelType } = require('discord.js');

const FfmpegCommand = require('fluent-ffmpeg');
const fs = require('node:fs');
const fetch = require('node-fetch');

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REFRESH_TOKEN } = process.env;
const Snoowrap = require('snoowrap');

const sendLog = require('./sendLog.js');

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

const parseRedditUrl = (redditUrl) => {
  const cleanUrl = redditUrl.split(/[?#]/)[0];

  const shortMatch = cleanUrl.match(/\/r\/[^/]+\/s\/([a-zA-Z0-9]+)/);
  const postMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.|old\.)?reddit\.com\/r\/[^/]+\/comments\/([a-z0-9]+)/i);
  const shareMatch = cleanUrl.match(/^https:\/\/redd\.it\/([a-z0-9]+)/i);
  const videoMatch = cleanUrl.match(/^https:\/\/v\.redd\.it\/([a-zA-Z0-9]+)/);

  if (shortMatch) return { url: cleanUrl, type: 'shortLink', id: shortMatch[1] };
  if (postMatch) return { url: cleanUrl, type: 'post', id: postMatch[1] };
  if (shareMatch) return { url: cleanUrl, type: 'post', id: shareMatch[1] };
  if (videoMatch) return { url: cleanUrl, type: 'video', id: videoMatch[1] };

  return { url: cleanUrl, type: 'unknown', id: null };
};

const getIdFromShortLink = async (redditUrlInfo) => {
  if (redditUrlInfo.type !== 'shortLink') return null;

  const res = await fetch(redditUrlInfo.url, { redirect: 'follow' });
  const finalUrl = res.url;

  const [, postMatch] = finalUrl.match(/\/comments\/([a-z0-9]+)/i);

  return postMatch;
};

const getMediaId = async (redditUrlInfo) => {
  const postId = (redditUrlInfo.type === 'post') ? redditUrlInfo.id : await getIdFromShortLink(redditUrlInfo);

  const reddit = new Snoowrap({
    userAgent: 'hahabot by u/couldie',
    clientId: REDDIT_CLIENT_ID,
    clientSecret: REDDIT_CLIENT_SECRET,
    refreshToken: REDDIT_REFRESH_TOKEN,
  });

  const postData = (await reddit.getSubmission(postId).fetch()).toJSON();
  if (!postData.is_video) return null;

  const [fallbackURL] = postData.secure_media.reddit_video.fallback_url.split('?');

  return URL.parse(fallbackURL).pathname.split('/')[1];
};

const redditVideos = async (client, message, redditUrl) => {
  try {
    const redditUrlInfo = parseRedditUrl(redditUrl);
    if (redditUrlInfo.type === 'unknown') return;

    const mediaId = (redditUrlInfo.type === 'video') ? redditUrlInfo.id : await getMediaId(redditUrlInfo);
    if (!mediaId) return;

    message.react('<a:dance:592076212256374784>');

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
          .then(async () => {
            if (message.channel.type === ChannelType.GuildText) message.suppressEmbeds(true);

            const messageReaction = await message.reactions.cache.get('592076212256374784');
            if (messageReaction) messageReaction.users.remove(client.user);

            fs.unlink(`${dir}/${mediaId}.mp4`, (err) => {
              if (err) throw err;
            });
          });
      })
      .run();
  } catch (error) {
    const messageReaction = await message.reactions.cache.get('592076212256374784');
    if (messageReaction) messageReaction.users.remove(client.user);
    sendLog(client, error, client.user);
  }
};

module.exports = { redditVideos };
