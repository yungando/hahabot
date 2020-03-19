exports.run = (client, message, args, tools) =>
{
    var [command, ...restArgs] = args;

    if (command == undefined || command.length == 0)
    {
        message.author.send('```~help\n\nAll commands are called using the ~ prefix:\n\nAdmin cmds:\n\n    purge        Deletes the last messages in a channel\n    migrate      Moves everyone in your voice channel to another specified voice channel\n    scatter      Moves everyone in your voice channel individually to other random voice channels\n\nComplex Inputs:\n\n    schedule     Event and lfg scheduler all built into a single command [Pub Crawl Only]\n    info         Sends an embed displaying all info about a user [Pub Crawl Only]\n    guide        Sends image galleries with helpful Destiny information and to assist with sherpa runs\n\nMessageID Inputs:\n\n    quote        Quotes a message in an embed\n    react        Adds a reaction to a message\n    vote         Adds an upvote and downvote reactions to a message\n\nText Inputs:\n\n    rank         Shows clan leaderboards\n    8ball        Ask haha bot a question and he\'ll give you a magic 8ball answer\n    copypasta    Displays a copypasta in an embed\n    wishes       Sends the Last Wish wall of wishes album\n\nNo Inputs:\n\n    blueberry    Moves non clan members from fireteam blueberry into the voice channel you are connected to [Pub Crawl Only]\n    runaway      Sends the runaway penguin embed\n\nType ~help [command] for more information on a specific command that has inputs e.g:\n\n    ~help schedule\n\nWritten and maintained by ando, message him with any questions.```')
    }
    else if (command == 'purge')
    {
        message.author.send('```~purge [number input]\n\nDeletes the last messages sent in the channel the command is sent in.\nRequires the user of the command to have the "Manage Messages" permission.\nOnly messages sent within the last 2 weeks can be deleted using this\ncommand. Example below:\n\n    ~purge 15\n\nThe input must be a number input between 1 and 100.\n\nType ~help devmode to find out how to get access to message and user IDs.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'scatter')
    {
        message.author.send('```~scatter\n\nMoves everyone in your voice channel individually to other random\nvoice channels. Requires the user of the command to have the "Move\nMembers" permission. Example below:\n\n    ~scatter\n\nNo input required.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'migrate')
    {
        message.author.send('```~migrate [voice channel name or ID]\n\nMoves everyone in your voice channel to another specified voice\nchannel. Requires the user of the command to have the "Move\nMembers" permission. Examples below:\n\n    ~migrate mariachi\n    ~migrate firteam apples\n    ~migrate 536275745308409903\n\nInput must be either the name or the channel ID of the voice\nchannel you want to move to.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'schedule')
    {
        message.author.send('```~schedule [action]\n\nhaha bot\'s lfg scheduler. Everything from creating, adding and removing members, to deleting schedules is handled with\nthis command. In examples, [square brackets] signify required input, {curly brackets} signify optional input. Do not\nuse brackets when using the commands. These commands work in any channel in the server, but most people post them in\n#raid-discussion.\n\ncreate:  ~schedule create [number of slots] [activity/raid Name] - [starting time] - {description} && {player user id}\n\n  Creates and formats a schedule in #raid-schedules, tagging @lfg to allow other clan members to join by reacting.\n  Optionally can add players to the schedule as it\'s created. Examples below:\n\n    ~schedule create 6 Garden of Salvation - 7pm EST, Tuesday 10th\n    ~schedule create 6 Garden of Salvation - 7pm EST, Tuesday 10th - Doing "Zero to One Hundred" Challenge\n    ~schedule create 6 Garden of Salvation - 7pm EST, Tuesday 10th && 560533863290372097\n\n\nadd:     ~schedule add [schedule message ID] [player user ID] {player user ID}\n\n  Adds clan members to a schedule, without them having to react to the post themselves. Optionally can add multiple\n  members at the same time. Anyone on a schedule can use this command. Examples below:\n\n    ~schedule add 595049434492960779 560533863290372097\n    ~schedule add 595049434492960779 560533863290372097 296023718839451649\n\n\nremove:  ~schedule remove [schedule message ID] [player user ID] {player user ID}\n\n  Removes clan members from a schedule, without them having to react to the post themselves. Optionally can remove\n  multiple members at the same time. Anyone on a schedule can use this command. Examples below:\n\n    ~schedule remove 595049434492960779 560533863290372097\n    ~schedule remove 595049434492960779 560533863290372097 296023718839451649```');
        
        message.author.send('```edit:    ~schedule edit [schedule message ID] [field] [new field input]\n\n  Edits a schedule. Fields that can be edited are: slots, activity, time, description, icon and iconsp. Icon has a set\n  list of inputs: crown, chalice, lastwish, scourge, raid, darkness, vanguard, crucible, gambit. "iconsp" can be used\n  to change the icon to any image via url. Only the owner of the schedule can use this command. Examples below:\n\n    ~schedule edit 595049434492960779 slots 12\n    ~schedule edit 595049434492960779 activity Leviathan\n    ~schedule edit 595049434492960779 iconsp https://i.imgur.com/NFG6DiF.jpg\n\n\nalert:   ~schedule alert [schedule message ID] {optional message}\n\n  Tags all members on a schedule. Optionally also sends a message to explain why they\'re getting tagged. Anyone on a\n  schedule can use this command. Examples below:\n\n    ~schedule alert 595049434492960779\n    ~schedule alert 595049434492960779 Starting in 5 mins, join fireteam apples\n\n\ndelete:  ~schedule delete [schedule message ID] {optional message}\n\n  Deletes a schedule. Optionally also sends a message to explain why the schedule is getting deleted. Anyone on a\n  schedule can use this command. Example below:\n\n    ~schedule delete 595049434492960779\n    ~schedule delete 595049434492960779 Unfortunately all spots weren\'t filled in time\n\n\ntransfer:  ~schedule transfer [schedule message ID] [player user id]\n\n  Transfers ownership of a schedule to the provided player id. New owner must already be on the schedule. Only the\n  schedule owner can use this command. Example below:\n\n    ~schedule transfer 595049434492960779 560533863290372097\n\n\nSchedule message IDs are displayed in the schedule footer next to the channel name. Example below:\n\n    #raid-schedules - 595049434492960779\n\nType ~help devmode to find out how to get access to message and user IDs.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'info')
    {
        message.author.send('```~info {user}\n\nSends an embed displaying all info about a user. This includes\nall roles they have in the Pub Crawl Server, a list of important\nthird party links to that user\' Destiny profile and other useful\nuser links. The command is limited to the #stats channel in Pub\nCrawl. Examples below:\n\n    ~info\n    ~info 269555580425863168\n    ~info @ando\n    ~info search 4611686018467391887\n\nTo get info on yourself just use the command without any input.\nTo get info on another clan member, input either their Discord\nID or @ them. The command can also be used to search third party\nIDs to find users in the server.\n\nType ~help devmode to find out how to get access to message and user IDs.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'dayone')
    {
        message.author.send('```~dayone [action]\n\nhaha bot\'s day one scheduler. Everything from creating, adding and removing members, to deleting\nschedules is handled with this command. In examples, [square brackets] signify required input,\n{curly brackets} signify optional input. Do not use brackets when using the commands.\n\ncreate:  ~dayone create {description}\n\n  Creates and formats a schedule in #garden-of-salvation. Examples below:\n\n    ~dayone create\n    ~dayone create Anyone welcome, message me to get added\n\n\nadd:     ~dayone add [schedule message ID] [player user ID] {player user ID}\n\n  Adds clan members to a day one schedule. Optionally can add multiple members at the same time.\nExamples below:\n\n    ~dayone add 595049434492960779 560533863290372097\n    ~dayone add 595049434492960779 560533863290372097 296023718839451649\n\n\nremove:  ~dayone remove [schedule message ID] [player user ID] {player user ID}\n\n  Removes clan members from a dayone schedule. Optionally can remove multiple members at the\nsame time. Examples below:\n\n    ~dayone remove 595049434492960779 560533863290372097\n    ~dayone remove 595049434492960779 560533863290372097 296023718839451649\n\n\nedit:    ~dayone edit [schedule message ID] description [new description input]\n\n  Edits a day one schedule. The only field that can be edited is the description. Contact ando\nto change the time. Examples below:\n\n    ~dayone edit 595049434492960779 description Anyone welcome, message me to get added\n    ~dayone edit 595049434492960779 description Must have at least 1 Flawless completion of a previous Raid```');
        
        message.author.send('```alert:   ~dayone alert [schedule message ID] {optional message}\n\n  Tags all members on a schedule. Optionally also sends a message to explain why they\'re getting\n  tagged. Examples below:\n\n    ~dayone alert 595049434492960779\n    ~schedule alert 595049434492960779 Starting in 5 mins, join fireteam apples\n\n\ndelete:  ~dayone delete [schedule message ID] {optional message}\n\n  Deletes a schedule. Optionally also sends a message to explain why the schedule is getting deleted.\n  Example below:\n\n    ~dayone delete 595049434492960779\n    ~dayone delete 595049434492960779 Merged with a different team\'s schedule\n\n\nSchedule message IDs are displayed in the schedule footer next to the channel name. Example below:\n\n    #garden-of-salvation - 595049434492960779\n\nType ~help devmode to find out how to get access to message and user IDs.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'quote')
    {
        message.author.send('```~quote [messageID]\n\nQuote\'s a message in an embed. Only messages sent in the same server\ncan be quoted using this command. Example below:\n\n    ~quote 599436744810561536\n\nThe input must be a messageID.\n\nType ~help devmode to find out how to get access to message and user IDs.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'react')
    {
        message.author.send('```~react [messageID] [emoji name]\n\nReacts to a message with a custom emoji. Example below:\n\n    ~react 599436744810561536 crabrave\n\nThe input must be a messageID and an emoji name.\n\nType ~help devmode to find out how to get access to message and user IDs.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'vote')
    {
        message.author.send('```~vote [messageID / ^]\n\nAdd\'s reddit upvote and downvote reactions to a message. Using a\ncaret \'^\' will apply the reactions to the last message sent in\nthat channel, using a messageID will apply the reactions to that\nspecific message no matter where in the server it\'s called.\nExamples below:\n\n    ~vote ^\n    ~vote 599436744810561536\n\nThe input must be a messageID or \'^\'.\n\nType ~help devmode to find out how to get access to message and user IDs.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'rank')
    {
        message.author.send('```~rank [leaderboard name]\n\nShows clan/server leaderboards. Example below:\n\n    ~rank flakes\n\nThe input must be a tracked leaderboard. Current leaderboards are: flakes, regulars and roles.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == '8ball')
    {
        message.author.send('```~8ball [question]\n\nAsk haha bot a question and he will reply with a random magic 8ball reply.\nYes/No questions make the most sense. Example below:\n\n    ~8ball When will ando get anarchy to drop\n\nThe input must be a question in a regular text format.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'copypasta')
    {
        message.author.send('```~copypasta [copypasta]\n\nPut\'s the copypasta into an embed for easier reading. Example below:\n\n    ~copypasta into thy mic i screech, into thy pillow i weep\n\nThe input must be a "copypasta" in a regular text format.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'guide')
    {
        message.author.send('```~guide [gallery] {page number}\n\nSends image galleries with helpful Destiny information and to assist with sherpa runs. Examples below:\n\n    ~guide wishes\n    ~guide wishes 9\n    ~guide niobe\n\nThe input must include the name of the gallery you want to view: \'wishes\', \'niobe\'. Optionally can also input a page number, as seen in the examples above.\n\nWritten and maintained by ando, message him with any questions.```');
    }
    else if (command == 'devmode')
    {
        message.author.send('https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-')
    }

    if (message.guild !== null)
    {
        message.delete();
    }
}