const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{
    var question = args.join(' ');

    var spongebobQuestion = question.toLowerCase().split('');

    for (var i = 1; i < spongebobQuestion.length; i+=2)
    {
        spongebobQuestion[i] = spongebobQuestion[i].toUpperCase();
    }

    spongebobQuestion = spongebobQuestion.join('');

    var answers = [ 'yes',
                    'no',
                    'I am also curious',
                    'shut the fuck up',
                    `https://lmgtfy.com/?q=${question.split(/ +/).join('+')}`,
                    'why the fuck my google hard',
                    'imagine asking a fucking program, a god damn discord bot for a fucking answer to a question. what kind of sick fucking freak asks a god damn bunch of ones and zeros questions that can change the outcome of your life. fucking god damn pitiful',
                    'is pepsi okay?',
                    'ask again in a minute',
                    `${spongebobQuestion}`,
                    'o no 4',
                    'ok that\'s a good question but first, riddle me this, who would win in a fight? remy from ratatouille or stuart little',
                    'i think you already know the answer',
                    'the answer will be clear when everyone can make a raid schedule correctly',
                    'lmao fuck if i know',
                    'lmao, why would i know, do i look like a fucking 8ball',
                    'the answer wasnt on the first page of google so i gave up looking',
                    'concentrate and ask again',
                    'signs point to yes',
                    'signs point to no',
                    'it is certain',
                    'just figure it out',
                    'what a dumb question']

    var quoteeUser = message.author;
    var quoteeGuildMember = message.member;

    let color = quoteeGuildMember.displayHexColor;

    if (color == '#000000')
    {
        color = '#99aab5';
    }

    const questionEmbed = new Discord.MessageEmbed()
    .setAuthor(quoteeGuildMember.displayName, quoteeUser.avatarURL({ format: "png", dynamic: true }))
    .setColor(color)
    .setDescription(question)
    .setFooter('~8ball')
    .setTimestamp(message.createdTimestamp);

    message.channel.send(answers[Math.floor(Math.random() * answers.length)], {embed: questionEmbed});

    message.delete();
};