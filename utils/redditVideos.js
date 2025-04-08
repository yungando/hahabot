const { AttachmentBuilder, ChannelType } = require('discord.js');

const FfmpegCommand = require('fluent-ffmpeg');
const fs = require('node:fs');
const fetch = require('node-fetch');

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REFRESH_TOKEN } = process.env;
const Snoowrap = require('snoowrap');

const sendLog = require('./sendLog.js');

const getMediaId = async (pathname) => {
  const reddit = new Snoowrap({
    userAgent: 'hahabot by u/couldie',
    clientId: REDDIT_CLIENT_ID,
    clientSecret: REDDIT_CLIENT_SECRET,
    refreshToken: REDDIT_REFRESH_TOKEN,
  });

  const [redditPostId] = pathname.split('comments/')[1].split('/');

  const redditPostData = (await reddit.getSubmission(redditPostId).fetch()).toJSON();

  if (!redditPostData.is_video) return null;

  const [fallbackURL] = redditPostData.secure_media.reddit_video.fallback_url.split('?');

  return URL.parse(fallbackURL).pathname.split('/')[1];
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

const redditVideos = async (client, message, redditURL) => {
  try {
    const parsedRedditURL = URL.parse(redditURL);

    if (!parsedRedditURL) return;

    const { hostname, pathname } = parsedRedditURL;

    const mediaId = (hostname !== 'v.redd.it') ? await getMediaId(pathname) : pathname.split('/')[1];

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

    console.log(error);
    sendLog(client, error, client.user);
  }
};

module.exports = { redditVideos };
