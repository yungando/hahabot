const {
  ChannelType, MessageFlags, ContainerBuilder, MediaGalleryBuilder,
} = require('discord.js');
const fetch = require('node-fetch');
const { xml2json } = require('xml-js');

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REFRESH_TOKEN } = process.env;
const Snoowrap = require('snoowrap');

const sendLog = require('./sendLog.js');

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

  return undefined;
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

const getHighestQualityMediaUrl = async (dashSet, mediaId) => {
  const dashMediaFilenames = dashSet.Representation
    // eslint-disable-next-line no-underscore-dangle
    .map((rep) => rep.BaseURL?._text)
    .filter((res) => res)
    .sort((a, b) => b.match(/\d+/) - a.match(/\d+/));

  for (const mediaFilename of dashMediaFilenames) {
    const testUrl = await fetch(`https://v.redd.it/${mediaId}/${mediaFilename}`);

    if (testUrl.ok) return testUrl.url;
  }

  return undefined;
};

module.exports = async (client, message, redditUrl) => {
  try {
    const redditUrlInfo = parseRedditUrl(redditUrl);
    if (!redditUrlInfo) return;

    const mediaId = redditUrlInfo.type === 'video'
      ? redditUrlInfo.id
      : await getMediaId(redditUrlInfo);
    if (!mediaId) return;

    message.react('<a:dance:592076212256374784>');

    const dashPlaylistResponse = await fetch(`https://v.redd.it/${mediaId}/DASHPlaylist.mpd`);
    const dashText = await dashPlaylistResponse.text();

    const dashPlaylist = await JSON.parse(xml2json(dashText, { compact: true }));
    const dashSets = dashPlaylist.MPD.Period.AdaptationSet;

    // eslint-disable-next-line no-underscore-dangle
    const dashVideoSet = dashSets.find((set) => set._attributes.contentType === 'video');
    // eslint-disable-next-line no-underscore-dangle
    const dashAudioSet = dashSets.find((set) => set._attributes.contentType === 'audio');

    const videoUrl = await getHighestQualityMediaUrl(dashVideoSet, mediaId);
    if (!videoUrl) {
      const messageReaction = await message.reactions.cache.get('592076212256374784');
      if (messageReaction) messageReaction.users.remove(client.user);
      return;
    }

    const audioUrl = await getHighestQualityMediaUrl(dashAudioSet, mediaId);

    const vxredditUrl = `https://vxreddit.com/redditvideo.mp4?video_url=${encodeURIComponent(videoUrl)}&audio_url=${encodeURIComponent(audioUrl)}`;

    const redditVideoContainer = new ContainerBuilder()
      .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(
        (mediaGalleryItem) => mediaGalleryItem.setURL(vxredditUrl),
      ));

    await message.reply({
      components: [redditVideoContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    if (message.channel.type === ChannelType.GuildText) message.suppressEmbeds(true);

    const messageReaction = await message.reactions.cache.get('592076212256374784');
    if (messageReaction) messageReaction.users.remove(client.user);
  } catch (error) {
    const messageReaction = await message.reactions.cache.get('592076212256374784');
    if (messageReaction) messageReaction.users.remove(client.user);

    const errorPayload = {
      logType: 'error',
      details: 'Failed attempting to handle reddit video.',
      message,
      error,
      user: message.author,
      guild: message.guild,
    };

    sendLog(client, errorPayload);
  }
};
