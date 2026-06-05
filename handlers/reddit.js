import axios from 'axios';
import { ChannelType, ContainerBuilder, MessageFlags } from 'discord.js';
import Snoowrap from 'snoowrap';
import { xml2json } from 'xml-js';
import sendLog from '../utils/send-log.js';
import { collapseNewlines, stripEmojis } from '../utils/text.js';

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REFRESH_TOKEN } = process.env;

const REDDIT_API_CLIENT = new Snoowrap({
  userAgent: 'hahabot by u/couldie',
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  refreshToken: REDDIT_REFRESH_TOKEN,
});

const isVideoUrlPathname = (pathname) => pathname.match(/^\/[^/]+$/);
const isShareUrlPathname = (pathname) => pathname.match(/\/r\/[^/]+\/s\/([a-z0-9]+)/i);

const getCommentId = (url) => url.match(/\/r\/[^/]+\/comments\/[^/]+\/[^/]+\/([a-z0-9]+)/)[1];
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
  const dashSetArray = Array.isArray(dashSets)
    ? dashSets
    : [dashSets];

  // eslint-disable-next-line no-underscore-dangle
  const dashVideoSet = dashSetArray.find((set) => set._attributes.contentType === 'video');
  // eslint-disable-next-line no-underscore-dangle
  const dashAudioSet = dashSetArray.find((set) => set._attributes.contentType === 'audio');

  const videoUrl = await getHighestQualityMediaUrl(dashVideoSet, mediaId);
  const audioUrl = dashAudioSet
    ? await getHighestQualityMediaUrl(dashAudioSet, mediaId)
    : undefined;

  const encodedVideoUriParam = `video_url=${encodeURIComponent(videoUrl)}`;
  const encodedAudioUriParam = audioUrl
    ? `&audio_url=${encodeURIComponent(audioUrl)}`
    : '';

  return `https://vxreddit.com/redditvideo.mp4?${encodedVideoUriParam}${encodedAudioUriParam}`;
};

const buildGalleryImageUrl = (imageMetadata) => {
  const [, fileExtension] = imageMetadata.m.split('/');

  return `https://i.redd.it/${imageMetadata.id}.${fileExtension}`;
};

const sanitiseBodyText = (bodyText) => {
  const sanitisedBodyText = collapseNewlines(bodyText);

  return sanitisedBodyText.length > 2000
    ? `${sanitisedBodyText.slice(0, 2000)}...`
    : sanitisedBodyText;
};

const mapRedditContainer = async (redditPost, redditComment) => {
  const permalink = redditComment
    ? `https://reddit.com${[redditComment.permalink]}`
    : `https://reddit.com${[redditPost.permalink]}`;

  const authorText = redditComment
    ? `> u/${redditComment.author.name} commented on ${redditPost.subreddit_name_prefixed}`
    : `> u/${redditPost.author} on ${redditPost.subreddit_name_prefixed}`;

  const redditContainer = new ContainerBuilder()
    .setAccentColor(0xFF4500)
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(authorText))
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(
      `## [${stripEmojis(redditPost.title)}](${permalink})`,
    ));

  if (redditComment) {
    const postText = sanitiseBodyText(redditComment.body);

    redditContainer.addTextDisplayComponents(
      (textDisplay) => textDisplay.setContent(postText),
    );

    return redditContainer;
  }

  if (redditPost.is_video) {
    const mediaId = getMediaId(redditPost.secure_media);
    const vxRedditUrl = await buildVxRedditUrl(mediaId);

    redditContainer.addMediaGalleryComponents(
      (mediaGallery) => mediaGallery.addItems(
        (mediaGalleryItem) => mediaGalleryItem.setURL(vxRedditUrl),
      ),
    );
  }

  if (redditPost.post_hint === 'image') {
    redditContainer.addMediaGalleryComponents(
      (mediaGallery) => mediaGallery.addItems(
        (mediaGalleryItem) => mediaGalleryItem.setURL(redditPost.url),
      ),
    );
  }

  if (redditPost.is_gallery) {
    const galleryItems = Object.values(redditPost.media_metadata).slice(0, 10);

    redditContainer.addMediaGalleryComponents(
      (mediaGallery) => mediaGallery.addItems(
        ...galleryItems.map(
          (item) => (mediaGalleryItem) => mediaGalleryItem.setURL(buildGalleryImageUrl(item)),
        ),
      ),
    );
  }

  if (redditPost.selftext) {
    const postText = sanitiseBodyText(redditPost.selftext);

    redditContainer.addTextDisplayComponents(
      (textDisplay) => textDisplay.setContent(postText),
    );
  }

  return redditContainer;
};

const handleRedditPostUrl = async (redditUrl) => {
  const redditPost = await getRedditPost(redditUrl);
  if (!redditPost) return undefined;

  return await mapRedditContainer(redditPost);
};

const handleRedditCommentUrl = async (redditUrl, commentId) => {
  const redditPost = await getRedditPost(redditUrl);
  if (!redditPost) return undefined;

  const redditComment = await REDDIT_API_CLIENT.getComment(commentId).fetch();
  if (!redditComment) return undefined;

  return await mapRedditContainer(redditPost, redditComment);
};

const handleRedditUrl = async (client, message, redditUrl) => {
  try {
    const redditCommentId = getCommentId(redditUrl);

    const redditContainer = redditCommentId
      ? await handleRedditCommentUrl(redditUrl, redditCommentId)
      : await handleRedditPostUrl(redditUrl);

    if (!redditContainer) return;

    await message.reply({
      components: [redditContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    if (message.channel.type === ChannelType.GuildText) message.suppressEmbeds(true);
  } catch (error) {
    const errorPayload = {
      logType: 'error',
      details: 'Failed attempting to handle reddit url.',
      message,
      error,
      user: message.author,
      guild: message.guild,
    };

    sendLog(client, errorPayload);
  }
};

export default handleRedditUrl;
