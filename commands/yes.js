exports.run = (client, message, args, tools) =>
{
    message.channel.send('yes');

    message.delete();
}