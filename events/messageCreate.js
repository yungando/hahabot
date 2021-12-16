const Discord = require('discord.js');

const sendLog = require("../utils/sendLog.js");
const { hahaDMID, hahaDMToken } = require('../webhooks.json');
const hahaDM = new Discord.WebhookClient({ id: hahaDMID, token: hahaDMToken });

const ffmpeg = require("fluent-ffmpeg");
const fs = require('fs');
const fetch = require('node-fetch');

module.exports =
{
    async execute(client, message)
    {
        if (message.partial) await message.fetch();

        if (message.content == '~spiderman')
        {
            if (message.author.tag == 'ando#0404')
            {
                const buttonRow = new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setStyle('DANGER')
                            .setCustomId('spiderman')
                            .setLabel('I have seen Spiderman: No Way Home and would like access to the spoilers channel')
                    );
    
                message.channel.send({ content: 'Click at your own risk.', components: [ buttonRow ] });
            }

            message.delete();
        }

        if (message.content.includes('🦀'))
        {
            message.react('🦀');
        }
    
        if (message.content.includes('<a:crabrave:586918323149602816>'))
        {
            message.react('586918323149602816');
        }

        if (message.author.bot) return; /////////////////////////////////////////////////////

        if (message.content === 'b')
        {
            message.channel.send('b');
        }
    
        if (message.content === 'thanks son')
        {
            if (message.author.tag === 'ando#0404')
            {
                message.channel.send('thanks dad');
            }
            else
            {
                message.channel.send('im calling the police');
            }
            
            sendLog(client, message.content, message.author, message.guild);
        }

        // auto-archive game threads
        if (message.channel.parentId == '785540936457125888')
        {
            clearTimeout(client.archiveTimers.get(`${message.channel.id}`));

            let timeout = setTimeout(function()
            {
                message.channel.setParent('917120901584150589', { lockPermissions: true });
            },
            (1000 * 60 * 60 * 24 * 21));

            client.archiveTimers.set(`${message.channel.id}`, timeout);
        }
    
        // un-archive game threads
        if (message.channel.parentId == '917120901584150589')
        {
            message.channel.setParent('785540936457125888', { lockPermissions: true });

            let timeout = setTimeout(function()
            {
                message.channel.setParent('917120901584150589', { lockPermissions: true });
            },
            (1000 * 60 * 60 * 24 * 21));

            client.archiveTimers.set(`${message.channel.id}`, timeout);
        }

        // dm webhook
        if (message.channel.type == 'DM')
        {
            if (message.attachments.size > 0)
            {
                //var attachments = []
                hahaDM.send({
                    content: message.content,
                    username: `${message.author.tag} - ${message.author.id}`,
                    avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true }),
                    files: [message.attachments.array()]
                });
            }
            else
            {
                hahaDM.send({
                    content: message.content,
                    username: `${message.author.tag} - ${message.author.id}`,
                    avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true })
                });
            }
        }

        // Reddit Videos
        if (message.content.includes('reddit.com'))
        {
            message.channel.sendTyping();

            try
            {
                var words = message.content.split(/ +/);
                var redditURL;
                var redditJSON;
        
                for (let i = 0; i < words.length; i++)
                {
                    if (words[i].includes('reddit.com'))
                    {
                        redditURL = `${words[i].split('?')[0]}.json`;
                    }
                }

                await fetch(redditURL)
                    .then(response => response.json())
                    .then(data =>
                    {
                        redditJSON = data;
                    });

                if (redditJSON[0].data.children[0].data.secure_media == null) return message.channel.stopTyping();
                if (redditJSON[0].data.children[0].data.secure_media.reddit_video == null) return message.channel.stopTyping();
                
                var videoURL = redditJSON[0].data.children[0].data.secure_media.reddit_video.fallback_url.split('?')[0];
                var redditPostID = videoURL.split('https://v.redd.it/')[1].split('/')[0];
                var audioURL = `https://v.redd.it/${redditPostID}/DASH_audio.mp4`;

                var dir = './redditvideos';

                if (!fs.existsSync(dir))
                {
                    fs.mkdirSync(dir);
                }

                var ffmpegCommand = new ffmpeg();
                ffmpegCommand.addInput(videoURL);

                await fetch(audioURL)
                    .then(response =>
                    {
                        if (response.status === 200)
                        {
                            ffmpegCommand.addInput(audioURL);
                        }
                    });

                ffmpegCommand.output(`${dir}/${redditPostID}.mp4`)
                    .on('err', function(err)
                    {
                        fs.unlink(`${dir}/${redditPostID}.mp4`, (fsErr) =>
                        {
                            if (fsErr) throw fsErr;
                        });

                        sendLog(client, err, client.user);
                    })
                    .on('end', function()
                    {
                        var attachment = new Discord.MessageAttachment(`${dir}/${redditPostID}.mp4`, `${redditPostID}.mp4`);

                        message.reply({ files: [attachment] })
                            .then(() =>
                            {
                                message.suppressEmbeds(true);

                                fs.unlink(`${dir}/${redditPostID}.mp4`, (err) =>
                                {
                                    if (err) throw err;
                                });
                            });
                    })
                    .run();
            }
            catch (e)
            {
                sendLog(client, e, client.user);
            }
        }
    }
};