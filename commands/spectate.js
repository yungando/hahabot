const db = require('quick.db');

exports.run = (client, message, args, tools) =>
{
    var input = args.join(' ');

    var spectateRole = message.guild.roles.cache.find(r => r.id == '669711463392215040');
    
    var allVoiceChannels = message.guild.channels.cache.filter(c => c.type == 'voice').array();
    var spectateVoice;

    if (allVoiceChannels.find(c => c.id == input))
    {
        spectateVoice = input;
    }
    else if (allVoiceChannels.find(c => c.name.includes(`${input}`)))
    {
        spectateVoice = allVoiceChannels.find(c => c.name.includes(`${input}`));
    }
    else
    {
        message.channel.send('**Couldn\'t find channel, please try again.**')
        .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    var fireteams = new db.table('fireteams');

    var channelID = spectateVoice.id;

    fireteams.get(`${channelID}`);

    if (!fireteams.get(`${channelID}.spectate`) == true)
    {
        fireteams.set(`${channelID}.slots`, spectateVoice.userLimit);

        for (var i = 0; i < spectateVoice.members.size; i++)
        {
            spectateVoice.members.array()[i].roles.add(spectateRole);
        }

        spectateVoice.setUserLimit(0);
        spectateVoice.overwritePermissions('534915212760055819', {'SPEAK' : false}); // everyone
        spectateVoice.overwritePermissions('669711463392215040', {'SPEAK' : true});  // spectate

        fireteams.set(`${channelID}.spectate`, true);
    }
    else
    {
        for (var i = 0; i < spectateRole.members.size; i++)
        {
            spectateRole.members.array()[i].roles.remove(spectateRole);
        }

        var slots = fireteams.get(`${channelID}.slots`);

        spectateVoice.lockPermissions();
        spectateVoice.setUserLimit(slots);

        fireteams.set(`${channelID}.spectate`, false);
    }
}