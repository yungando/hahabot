import axios from 'axios';
import { ChannelType, ContainerBuilder, MessageFlags } from 'discord.js';
import sendLog from '../utils/send-log.js';
import { collapseNewlines, stripEmojis } from '../utils/text.js';

const getTwitterPost = async (pathname) => {
  const [requestPath] = pathname.match(/^((?:\/[^/]+){3})/);
  const response = await axios.get(`https://api.fxtwitter.com${requestPath}`);

  return response.data.tweet;
};

const mapPostContainer = async (tweet) => {
  const authorNameDisplay = `[${stripEmojis(tweet.author.name)} (@${tweet.author.screen_name})](${tweet.url})`;

  const twitterPostContainer = new ContainerBuilder()
    .setAccentColor(0x1DA1F2)
    .addSectionComponents((section) => {
      section
        .setThumbnailAccessory({ media: { url: tweet.author.avatar_url, width: 10 } })
        .addTextDisplayComponents(
          (textDisplay) => textDisplay.setContent(authorNameDisplay),
        );

      if (tweet.text) {
        section.addTextDisplayComponents(
          (textDisplay) => textDisplay.setContent(collapseNewlines(tweet.text)),
        );
      }

      if (tweet.article) {
        section
          .addTextDisplayComponents(
            (textDisplay) => textDisplay.setContent(`# ${tweet.article.title}`),
          )
          .addTextDisplayComponents(
            (textDisplay) => textDisplay.setContent(`${tweet.article.preview_text}...`),
          );
      }

      return section;
    });

  if (tweet.article) {
    twitterPostContainer.addMediaGalleryComponents(
      (mediaGallery) => mediaGallery.addItems(
        (mediaGalleryItem) => mediaGalleryItem
          .setURL(tweet.article.cover_media.media_info.original_img_url),
      ),
    );
  }

  if (tweet.media) {
    twitterPostContainer.addMediaGalleryComponents(
      (mediaGallery) => mediaGallery.addItems(
        ...tweet.media.all.map(
          (item) => (mediaGalleryItem) => mediaGalleryItem.setURL(item.url),
        ),
      ),
    );
  }

  if (tweet.quote) {
    const quoteAuthorNameDisplay = `[${stripEmojis(tweet.quote.author.name)} (@${tweet.quote.author.screen_name})](${tweet.quote.url})`;

    twitterPostContainer.addTextDisplayComponents(
      (textDisplay) => textDisplay.setContent(
        `>>> ${quoteAuthorNameDisplay}\n\n${tweet.quote.text}`,
      ),
    );

    if (tweet.quote.media) {
      twitterPostContainer.addMediaGalleryComponents(
        (mediaGallery) => mediaGallery.addItems(
          ...tweet.quote.media.all.map(
            (item) => (mediaGalleryItem) => mediaGalleryItem.setURL(item.url),
          ),
        ),
      );
    }
  }

  return twitterPostContainer;
};

const handleTwitterUrl = async (client, message, twitterUrl) => {
  try {
    const { pathname } = new URL(twitterUrl);
    const twitterPost = await getTwitterPost(pathname);

    const twitterPostEmbed = await mapPostContainer(twitterPost);
    await message.reply({
      components: [twitterPostEmbed],
      flags: MessageFlags.IsComponentsV2,
    });

    if (message.channel.type === ChannelType.GuildText) message.suppressEmbeds(true);
  } catch (error) {
    const errorPayload = {
      logType: 'error',
      details: 'Failed attempting to handle twitter post.',
      message,
      error,
      user: message.author,
      guild: message.guild,
    };

    sendLog(client, errorPayload);
  }
};

export default handleTwitterUrl;
