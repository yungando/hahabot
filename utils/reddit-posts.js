import axios from 'axios';
import { ChannelType, ContainerBuilder, MessageFlags } from 'discord.js';
import Snoowrap from 'snoowrap';
import { xml2json } from 'xml-js';
import sendLog from './send-log.js';

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REFRESH_TOKEN } = process.env;

const REDDIT_API_CLIENT = new Snoowrap({
  userAgent: 'hahabot by u/couldie',
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  refreshToken: REDDIT_REFRESH_TOKEN,
});

const isVideoUrlPathname = (pathname) => pathname.match(/^\/[^/]+$/);
const isShareUrlPathname = (pathname) => pathname.match(/\/r\/[^/]+\/s\/([a-z0-9]+)/i);

const getPostIdFromPathname = (url) => url.match(/\/r\/[^/]+\/comments\/([a-z0-9]+)/i)[1];
const getPathnameFromShareLink = async (sharePathname) => {
  try {
    await REDDIT_API_CLIENT.oauthRequest({ uri: sharePathname, method: 'get' });
  } catch (error) {
    const redirectPathname = error.response?.request?.path;
    if (!redirectPathname) throw new Error('Expected path from share link redirect', { cause: error });

    return redirectPathname;
  }

  throw new Error('Expected redirect but request succeeded');
};

const fetchPostResponse = async (pathname) => {
  if (isVideoUrlPathname(pathname)) {
    return REDDIT_API_CLIENT.oauthRequest({
      uri: `video${pathname}`,
      method: 'get',
    });
  };

  const postPathname = isShareUrlPathname(pathname)
    ? await getPathnameFromShareLink(pathname)
    : pathname;

  const postId = getPostIdFromPathname(postPathname);

  return REDDIT_API_CLIENT.getSubmission(postId).fetch();
};

const getRedditPost = async (rawUrl) => {
  const { pathname } = new URL(rawUrl);

  const response = await fetchPostResponse(pathname);

  // eslint-disable-next-line no-unused-vars
  const { comments, ...postData } = response.toJSON();

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
  const dashPlaylistResponse = await axios.get(`https://v.redd.it/${mediaId}/DASHPlaylist.mpd`);
  const dashText = await dashPlaylistResponse.data;

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

const stripEmojis = (text) => text
  .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
  .replace(/\s{2,}/g, ' ')
  .trim();

const mapPostContainer = async (redditPost) => {
  const redditPostPermalink = `https://reddit.com${[redditPost.permalink]}`;

  const redditPostContainer = new ContainerBuilder()
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(
      `> u/${redditPost.author} on ${redditPost.subreddit_name_prefixed}`,
    ))
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(
      `## [${stripEmojis(redditPost.title)}](${redditPostPermalink})`,
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
        ...galleryItems.map(
          (item) => (mediaGalleryItem) => mediaGalleryItem.setURL(buildGalleryImageUrl(item)),
        ),
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

const handleRedditLink = async (client, message, redditUrl) => {
  try {
    const redditPost = await getRedditPost(redditUrl);
    if (!redditPost) return;

    const redditPostContainer = await mapPostContainer(redditPost);

    await message.reply({
      components: [redditPostContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    if (message.channel.type === ChannelType.GuildText) message.suppressEmbeds(true);
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

export default handleRedditLink;
