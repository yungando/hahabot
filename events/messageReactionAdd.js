import { QuickDB } from 'quick.db';
import sendLog from '../utils/sendLog.js';

const db = new QuickDB();
const servers = db.table('servers');

export default {
  async execute(client, messageReaction, user) {
    try {
      if (messageReaction.partial) await messageReaction.fetch();
      if (user.partial) await user.fetch();

      if (user.bot) return;

      const { message, emoji } = messageReaction;

      if (await servers.get(`${message.guild.id}.serverName`) !== message.guild.name) {
        await servers.set(`${message.guild.id}.serverName`, message.guild.name);
      }

      const upvoteId = '594816363722309645';
      const downvoteId = '594816363533565991';

      // Upvote/Downvote system
      if (emoji.id === upvoteId) {
        const downvote = message.reactions.cache.get(downvoteId);

        if (downvote) downvote.users.remove(user);
      }

      if (emoji.id === downvoteId) {
        const upvote = message.reactions.cache.get(upvoteId);

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
