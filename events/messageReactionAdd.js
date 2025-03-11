const sendLog = require('../utils/sendLog.js');

module.exports = {
  async execute(client, messageReaction, user) {
    if (messageReaction.partial) await messageReaction.fetch();
    if (user.partial) await user.fetch();

    if (user.bot) return;

    try {
      const { message, emoji } = messageReaction;

      // Upvote/Downvote system
      if (emoji.id === '594816363722309645') {
        const downvote = message.reactions.cache.get('594816363533565991');

        if (downvote) downvote.users.remove(user);
      } else if (emoji.id === '594816363533565991') {
        const upvote = message.reactions.cache.get('594816363722309645');

        if (upvote) upvote.users.remove(user);
      }
    } catch (error) {
      sendLog(client, error.toString(), client.user);
    }
  },
};
