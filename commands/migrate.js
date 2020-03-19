exports.run = (client, message, args, tools) =>
{
    var input = args.join(' ');

    var currentChannel = message.member.voice.channel;

    if ((!currentChannel) || (!message.member.permissions.has('MOVE_MEMBERS')))
    {
        message.delete();

        return;
    }

    var allVoiceChannels = message.guild.channels.cache.filter(c => c.type == 'voice').array();
    var newVoice;

    if (allVoiceChannels.find(c => c.id == input))
    {
        newVoice = input;
    }
    else if (allVoiceChannels.find(c => c.name.includes(`${input}`)))
    {
        newVoice = allVoiceChannels.find(c => c.name.includes(`${input}`)).id;
    }
    else
    {
        message.delete();

        return;
    }

    var members = currentChannel.members.array();
    
    for (var i = 0; i < members.length; i++)
    {
        members[i].voice.setChannel(newVoice)
                    .catch(console.error);
    }

    message.delete();
}