exports.run = (client, message, args, tools) =>
{
    const amount = parseInt(args[0]) + 1;

    if (!message.member.permissions.has('MANAGE_MESSAGES'))
    {
        message.delete();

        return;
    }
    else if (isNaN(amount))
    {
        message.channel.send('**Please supply a valid amount of messages to purge**')
                       .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }
    else if (amount <= 1 || amount > 100)
    {
        message.channel.send('**Please supply a number less than 100**')
                       .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    message.channel.bulkDelete(amount, true)
        .then( messages => message.channel.send(`**Successfully deleted \`${amount-1}\` messages**`)
                                            .then( msg => msg.delete({ timeout: 10000 })))
        .catch( error => message.channel.send(`**ERROR:** ${error.message}`)
                                            .then( msg => msg.delete({ timeout: 10000 })));
}