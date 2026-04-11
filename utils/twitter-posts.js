import axios from 'axios';
import { ChannelType, ContainerBuilder, MessageFlags } from 'discord.js';
import sendLog from './send-log.js';
import stripEmojis from './strip-emojis.js';

const getTwitterPost = async (pathname) => {
  const response = await axios.get(`https://api.fxtwitter.com${pathname}`);

  return response.data.tweet;
};

const mapPostContainer = async (tweet) => {
  const { author, media, quote } = tweet;

  const authorNameDisplay = `> [${stripEmojis(author.name)} (@${author.screen_name})](${tweet.url})`;

  const twitterPostContainer = new ContainerBuilder()
    .setAccentColor(0x1DA1F2)
    .addSectionComponents((section) => section
      .setThumbnailAccessory({ media: { url: author.avatar_url, width: 10 } })
      .addTextDisplayComponents(
        (textDisplay) => textDisplay.setContent(authorNameDisplay),
      )
      .addTextDisplayComponents(
        (textDisplay) => textDisplay.setContent(tweet.text),
      ));

  if (media) {
    twitterPostContainer.addMediaGalleryComponents(
      (mediaGallery) => mediaGallery.addItems(
        ...media.all.map(
          (item) => (mediaGalleryItem) => mediaGalleryItem.setURL(item.url),
        ),
      ),
    );
  }

  if (quote) {
    const quoteAuthorNameDisplay = `[${stripEmojis(quote.author.name)} (@${quote.author.screen_name})](${quote.url})`;

    twitterPostContainer.addTextDisplayComponents(
      (textDisplay) => textDisplay.setContent(
        `>>> ${quoteAuthorNameDisplay}\n\n${quote.text}`,
      ),
    );

    if (quote.media) {
      twitterPostContainer.addMediaGalleryComponents(
        (mediaGallery) => mediaGallery.addItems(
          ...quote.media.all.map(
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
