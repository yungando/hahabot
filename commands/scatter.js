exports.run = (client, message, args, tools) =>
{
    var currentChannel = message.member.voice.channel;

    if ((!currentChannel) || (!message.member.permissions.has('MOVE_MEMBERS')))
    {
        message.delete();

        return;
    }

    var members = currentChannel.members.array();
    var allVoiceChannels = message.guild.channels.cache.filter(c => c.type == 'voice').array();

    for (let i = 0; i < allVoiceChannels.length; i++)
    {
        if (allVoiceChannels[i].id.includes(currentChannel.id))
        {
            allVoiceChannels.splice(i, 1);
            i--;
        }
    }

    for (var i = 0; i < members.length; i++)
    {
        members[i].voice.setChannel(allVoiceChannels[Math.floor(Math.random() * allVoiceChannels.length)].id)
                  .catch(console.error);
    }

    message.delete();
}