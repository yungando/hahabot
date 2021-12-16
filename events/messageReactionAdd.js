const sendLog = require("../utils/sendLog.js");

module.exports = 
{
    async execute(client, messageReaction, user)
    {
        if (messageReaction.partial) await messageReaction.fetch();
        if (user.partial) await user.fetch();

        if (user.bot) return;
    
        let message = messageReaction.message;
        let emoji = messageReaction.emoji;
        
        // Upvote/Downvote system
        if (emoji.id == '594816363722309645')
        {    
            let downvote = message.reactions.cache.get('594816363533565991');
            
            if (downvote != undefined)
            {
                downvote.users.remove(user);
            }
        }
        else if (emoji.id == '594816363533565991')
        {    
            let upvote = message.reactions.cache.get('594816363722309645');
    
            if (upvote != undefined)
            {
                upvote.users.remove(user);
            }
        }
    }
};