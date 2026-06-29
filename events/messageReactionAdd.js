import { EMOJI } from '../config/constants.js';
import sendLog from '../utils/send-log.js';

export default {
  async execute(client, messageReaction, user) {
    try {
      if (messageReaction.partial) await messageReaction.fetch();
      if (user.partial) await user.fetch();

      if (user.bot) return;

      const { message, emoji } = messageReaction;

      // Upvote/Downvote system
      if (emoji.id === EMOJI.upvote.id) {
        const downvote = message.reactions.cache.get(EMOJI.downvote.id);

        if (downvote) downvote.users.remove(user);
      }

      if (emoji.id === EMOJI.downvote.id) {
        const upvote = message.reactions.cache.get(EMOJI.upvote.id);

        if (upvote) upvote.users.remove(user);
      }
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: 'Failed attempting to add reaction to message.',
        message: messageReaction.message,
        error,
        user,
        guild: messageReaction.message.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
