const { ChannelType, MessageFlags, ContainerBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { xml2json } = require('xml-js');

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REFRESH_TOKEN } = process.env;
const Snoowrap = require('snoowrap');

const sendLog = require('./sendLog.js');

const getRedditPostIdByShortLink = async (url) => {
  const response = await fetch(url, { redirect: 'follow' });
  const destinationUrl = response.url;

  const [, postMatch] = destinationUrl.match(/\/comments\/([a-z0-9]+)/i);

  return postMatch;
};

const parseRedditUrl = async (redditUrl) => {
  const cleanUrl = redditUrl.split(/[?#]/)[0];

  const shortMatch = cleanUrl.match(/\/r\/[^/]+\/s\/([a-zA-Z0-9]+)/);
  const postMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.|old\.)?reddit\.com\/r\/[^/]+\/comments\/([a-z0-9]+)/i);
  const shareMatch = cleanUrl.match(/^https:\/\/redd\.it\/([a-z0-9]+)/i);
  const videoMatch = cleanUrl.match(/^https:\/\/v\.redd\.it\/([a-zA-Z0-9]+)/);

  if (shortMatch) return { url: cleanUrl, type: 'shortLink', id: await getRedditPostIdByShortLink(cleanUrl) };
  if (postMatch) return { url: cleanUrl, type: 'post', id: postMatch[1] };
  if (shareMatch) return { url: cleanUrl, type: 'post', id: shareMatch[1] };
  if (videoMatch) return { url: cleanUrl, type: 'video', id: videoMatch[1] };

  return undefined;
};

const getRedditPostById = async (postId) => {
  const redditApiClient = new Snoowrap({
    userAgent: 'hahabot by u/couldie',
    clientId: REDDIT_CLIENT_ID,
    clientSecret: REDDIT_CLIENT_SECRET,
    refreshToken: REDDIT_REFRESH_TOKEN,
  });

  const response = await redditApiClient.getSubmission(postId).fetch();
  const postData = response.toJSON();

  postData.comments = [];

  return postData;
};

const getMediaId = (secureMedia) => {
  const [fallbackURL] = secureMedia.reddit_video.fallback_url.split('?');

  return URL.parse(fallbackURL).pathname.split('/')[1];
};

const getHighestQualityMediaUrl = async (dashSet, mediaId) => {
  const dashRepresentations = [dashSet.Representation].flat();

  const dashMediaFilenames = dashRepresentations
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

const buildVxRedditUrl = async (mediaId) => {
  const dashPlaylistResponse = await fetch(`https://v.redd.it/${mediaId}/DASHPlaylist.mpd`);
  const dashText = await dashPlaylistResponse.text();

  const dashPlaylist = await JSON.parse(xml2json(dashText, { compact: true }));
  const dashSets = dashPlaylist.MPD.Period.AdaptationSet;

  // eslint-disable-next-line no-underscore-dangle
  const dashVideoSet = dashSets.find((set) => set._attributes.contentType === 'video');
  // eslint-disable-next-line no-underscore-dangle
  const dashAudioSet = dashSets.find((set) => set._attributes.contentType === 'audio');

  const videoUrl = await getHighestQualityMediaUrl(dashVideoSet, mediaId);
  const audioUrl = await getHighestQualityMediaUrl(dashAudioSet, mediaId);

  return `https://vxreddit.com/redditvideo.mp4?video_url=${encodeURIComponent(videoUrl)}&audio_url=${encodeURIComponent(audioUrl)}`;
};

const buildGalleryImageUrl = (imageMetadata) => {
  const [, fileExtension] = imageMetadata.m.split('/');

  return `https://i.redd.it/${imageMetadata.id}.${fileExtension}`;
};

const mapRedditPostContainer = async (redditPost) => {
  const redditPostPermalink = `https://reddit.com${[redditPost.permalink]}`;

  const redditPostContainer = new ContainerBuilder()
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(
      `> u/${redditPost.author} on ${redditPost.subreddit_name_prefixed}`,
    ))
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(
      `## [${redditPost.title}](${redditPostPermalink})`,
    ));

  if (redditPost.is_video) {
    const mediaId = getMediaId(redditPost.secure_media);
    const vxRedditUrl = await buildVxRedditUrl(mediaId);

    redditPostContainer.addMediaGalleryComponents(
      (mediaGallery) => mediaGallery.addItems(
        (mediaGalleryItem) => mediaGalleryItem.setURL(vxRedditUrl),
      ),
    );
  }

  if (redditPost.post_hint === 'image') {
    redditPostContainer.addMediaGalleryComponents(
      (mediaGallery) => mediaGallery.addItems(
        (mediaGalleryItem) => mediaGalleryItem.setURL(redditPost.url),
      ),
    );
  }

  if (redditPost.is_gallery) {
    const galleryItems = Object.values(redditPost.media_metadata);

    redditPostContainer.addMediaGalleryComponents(
      (mediaGallery) => mediaGallery.addItems(
        ...galleryItems.map((item) => (
          (mediaGalleryItem) => mediaGalleryItem.setURL(buildGalleryImageUrl(item))
        )),
      ),
    );
  }

  if (redditPost.selftext) {
    const postText = redditPost.selftext.length > 2000
      ? `${redditPost.selftext.slice(0, 2000)}...`
      : redditPost.selftext;

    redditPostContainer.addTextDisplayComponents(
      (textDisplay) => textDisplay.setContent(postText),
    );
  }

  return redditPostContainer;
};

module.exports = async (client, message, redditUrl) => {
  if (message.channel.type === ChannelType.GuildText) message.suppressEmbeds(true);

  try {
    const redditUrlInfo = await parseRedditUrl(redditUrl);
    if (!redditUrlInfo) return;

    const redditPost = await getRedditPostById(redditUrlInfo.id);
    if (!redditPost) return;

    const redditPostContainer = await mapRedditPostContainer(redditPost);

    await message.reply({
      components: [redditPostContainer],
      flags: MessageFlags.IsComponentsV2,
    });
  } catch (error) {
    const errorPayload = {
      logType: 'error',
      details: 'Failed attempting to handle reddit post.',
      message,
      error,
      user: message.author,
      guild: message.guild,
    };

    sendLog(client, errorPayload);
  }
};
