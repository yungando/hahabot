exports.run = (client, message, args, tools) =>
{
    var currentChannel = message.member.voice.channel;
    var ftblueberry = message.guild.channels.cache.get('540546590348279828');

    var members = ftblueberry.members.array();

    for (var i = 0; i < members.length; i++)
    {
        members[i].voice.setChannel(currentChannel.id)
                  .catch(console.error);
    }

    message.delete();
}