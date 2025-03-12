const sendLog = require('../utils/sendLog.js');

module.exports = {
  async execute(client, messageReaction, user) {
    if (messageReaction.partial) await messageReaction.fetch();
    if (user.partial) await user.fetch();

    if (user.bot) return;

    try {
      const { message, emoji } = messageReaction;

      const upvoteId = '594816363722309645';
      const downvoteId = '594816363722309645';

      // Upvote/Downvote system
      if (emoji.id === upvoteId) {
        const downvote = message.reactions.cache.get(downvoteId);

        if (downvote) downvote.users.remove(user);
      } else if (emoji.id === downvoteId) {
        const upvote = message.reactions.cache.get(upvoteId);

        if (upvote) upvote.users.remove(user);
      }
    } catch (error) {
      sendLog(client, error.toString(), client.user);
    }
  },
};
