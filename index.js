const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], restRequestTimeout: 60000 });

const db = require('quick.db');
var servers = new db.table('servers');

const ffmpeg = require("fluent-ffmpeg");

const fs = require('fs');
const fetch = require('node-fetch');

const { prefix, token } = require('./config.json');

const { hahaDMID, hahaDMToken } = require('./webhooks/hahaDM.json');
const hahaDM = new Discord.WebhookClient(hahaDMID, hahaDMToken);

const { hahaLOGID, hahaLOGToken } = require('./webhooks/hahaLOG.json');
const hahaLOG = new Discord.WebhookClient(hahaLOGID, hahaLOGToken);

const { wishes, niobe } = require('./webhooks/galleries.json');

function getTimestamp(ts)
{
    var str =   ts.getUTCFullYear() + "/" +
                ("0" + (ts.getUTCMonth()+1)).slice(-2) + "/" +
                ("0" + ts.getUTCDate()).slice(-2) + " " +
                ("0" + ts.getUTCHours()).slice(-2) + ":" +
                ("0" + ts.getUTCMinutes()).slice(-2) + ":" +
                ("0" + ts.getUTCSeconds()).slice(-2) + ' (UTC)';

    return str;
}

function getTimeSince(ts)
{
    var seconds = Math.floor((new Date() - ts) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1)
    {
        if (Math.floor(interval) == 1)
        {
            return 'a year';
        }

        return Math.floor(interval) + " years";
    }

    interval = seconds / 2592000;

    if (interval > 1)
    {
        if (Math.floor(interval) == 1)
        {
            return 'a month';
        }

        return Math.floor(interval) + " months";
    }

    interval = seconds / 86400;

    if (interval > 1)
    {
        if (Math.floor(interval) == 1)
        {
            return 'a day';
        }

        return Math.floor(interval) + " days";
    }

    interval = seconds / 3600;

    if (interval > 1)
    {
        if (Math.floor(interval) == 1)
        {
            return 'an hour';
        }

        return Math.floor(interval) + " hours";
    }

    interval = seconds / 60;

    if (interval > 1)
    {
        if (Math.floor(interval) == 1)
        {
            return 'a minute';
        }

        return Math.floor(interval) + " minutes";
    }

    if (Math.floor(seconds) == 1)
    {
        return 'a second';
    }

    return Math.floor(seconds) + " seconds";
}

function sendLog(content, user, guild)
{
    var username = `${user.tag} - ${user.id}`;
    var displayPic = user.displayAvatarURL({ format: "png", dynamic: true });

    if (user == client.user)
    {
        username = 'hahabot';
    }

    if (guild)
    {
        if (guild.members.cache.find(m => m.id == user.id))
        {
            var member = guild.members.cache.find(m => m.id == user.id);
    
            if (member.nickname)
            {
                var displayName = member.nickname;
                
                username = `${displayName} - ${user.tag} - ${user.id}`;
                
                var displayLength = username.length - 80;
    
                if (displayLength > 0)
                {
                    username = `${displayName.toString().slice(0, (displayName.length - displayLength - 1))}… - ${user.tag} - ${user.id}`;
                }
            }
        }
    }

    hahaLOG.send(content.toString().slice(0, 2000), {
        username: username,
        avatarURL: displayPic
    });
}

client.once('ready', () => 
{
    console.log('Ready!');
    sendLog('ready', client.user);
});

const events = 
{
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
};

client.on('message', async (message) =>
{
    let msg = message.content.toUpperCase();
    let sender = message.author;
    let args = message.content.slice(prefix.length).split(/ +/);
    let cmd = args.shift().toLowerCase();

    if (!msg.startsWith(prefix)) return;
    if (sender.bot) return;

    try
    {
        let commandFile = require(`./commands/${cmd}.js`);
        commandFile.run(client, message, args);
    }
    catch (e)
    {
        sendLog(e, client.user);
    }
    finally
    {
        sendLog(message.content, message.author, message.guild);
    }
});

client.on('guildMemberAdd', async (member) =>
{
    try
    {
        var channelID = servers.get(`${member.guild.id}.joinMessagesID`);

        if (channelID != null)
        {
            var joinMessages = member.guild.channels.cache.find(c => c.id == channelID);

            if (joinMessages == null)
            {
                servers.delete(`${member.guild.id}.joinMessagesID`)

                return;
            }

            var now = new Date();

            var desc = [    `• Profile: <@${member.user.id}>`,
                            `• Created: \`${getTimestamp(member.user.createdAt)}\` (${getTimeSince(member.user.createdAt)} ago)`,
                            `• Joined: \`${getTimestamp(member.joinedAt)}\`` ];

            const notification = new Discord.MessageEmbed()
                .setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ format: "png", dynamic: true }))
                .setColor('#4cff4c')
                .setDescription(desc.join('\n'))
                .setFooter('User joined')
                .setTimestamp(now);

            joinMessages.send({ embed:notification });
        }
    }
    catch (e)
    {
        sendLog(e, client.user);
    }
});

client.on('guildMemberRemove', async (member) =>
{
    try
    {
        var channelID = servers.get(`${member.guild.id}.leaveMessagesID`);

        if (channelID != null)
        {
            var leaveMessages = member.guild.channels.cache.find(c => c.id == channelID);

            if (leaveMessages == null)
            {
                servers.delete(`${member.guild.id}.leaveMessagesID`)

                return;
            }

            var now = new Date();

            var desc = [    `• Profile: <@${member.user.id}>`,
                            `• Joined: \`${getTimestamp(member.joinedAt)}\` (${getTimeSince(member.joinedAt)} ago)`,
                            `• Left: \`${getTimestamp(now)}\`` ];

            var roles = [];

            member.roles.cache.sort((roleA, roleB) => roleB.rawPosition - roleA.rawPosition).filter(role => role.name != '@everyone').each(role => roles.push(`<@&${role.id}>`));

            if (roles.length != 0)
            {
                desc.push(`• Roles: ${roles.join(' ')}`);
            }

            const notification = new Discord.MessageEmbed()
                .setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ format: "png", dynamic: true }))
                .setColor('#2f3136')
                .setDescription(desc.join('\n'))
                .setFooter('User left')
                .setTimestamp(now);

            leaveMessages.send({ embed:notification });
        }
    }
    catch (e)
    {
        sendLog(e, client.user);
    }
});

client.on('guildMemberUpdate', async (oldMember, newMember) =>
{
    let guild = oldMember.guild;

    if (guild.id != '534915212760055819') return; // Pub Crawl

    if ((oldMember.roles.cache.some(r => r.name === 'nitro')) && (!newMember.roles.cache.some(r => r.name === 'nitro')))
    {
        guild.systemChannel.send(`<@${newMember.id}> unboosted the server.`);
    }
});

client.on('messageReactionAdd', async (reaction, user) =>
{
    if (user.bot) return;

    if (reaction.partial)
    {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        
        try
        {
			await reaction.fetch();
        }
        catch (error)
        {
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

    let message = reaction.message;
    let emoji = reaction.emoji;

    if (message.channel.type == 'text')
    {
        var member = message.guild.members.cache.find(m => m.id == user.id);
    }

    // SCHEDULES
    if (message.author.id == '560533863290372097')
    {        
        if (message.embeds[0] != undefined && message.embeds[0] != 0)
        {
            if (message.embeds[0].footer)
            {
                if (message.embeds[0].footer.text.split(' - ')[0] == '#raid-schedules')
                {
                    if (user.bot) return;
            
                    if (emoji.id == '593898113626800129') // Add to Raid Schedule
                    {
                        reaction.users.remove(user);

                        if (message.guild.id == '534915212760055819')
                        {
                            if (!message.guild.members.cache.find(m => m.id == user.id).roles.cache.some(r => r.id == '534919438726856735'))
                            {
                                return;
                            }
                        }

                        const editedEmbed = new Discord.MessageEmbed(message.embeds[0]);

                        var roster = editedEmbed.fields[0].value;

                        if (roster.includes(user.id))
                        {
                            return;
                        }

                        roster = roster.split('\n');
                        
                        for (var i = 0; i < roster.length; i++)
                        {
                            if (!roster[i].includes('@'))
                            {
                                roster[i] = `${i+1}) <@${user.id}>`;
                                break;
                            }
                        }

                        roster = roster.join('\n');
            
                        editedEmbed.spliceFields(0, 1);
            
                        editedEmbed.addField('Roster', roster);

                        var displayName = message.guild.members.cache.find(m => m.id == user.id).displayName;
                        var description = editedEmbed.description.replace('\n', ' - ').replace(/[**]/g, '');
                        var raidID = message.id;

                        var schedule = `${displayName} **joined** - ${description} - ${raidID}`;

                        sendLog(schedule, user, message.guild);
            
                        message.edit('', {embed: editedEmbed});
                    }
                    else if (emoji.id == '593898113639383040') // Remove from Raid Schedule
                    {
                        reaction.users.remove(user);

                        if (message.guild.id == '534915212760055819')
                        {
                            if (!message.guild.members.cache.find(m => m.id == user.id).roles.cache.some(r => r.id == '534919438726856735'))
                            {
                                return;
                            }
                        }

                        const editedEmbed = new Discord.MessageEmbed(message.embeds[0]);

                        var roster = editedEmbed.fields[0].value;

                        if (!roster.includes(user.id))
                        {
                            return;
                        }

                        roster = roster.split('\n');
            
                        for (var i = 0; i < roster.length; i++)
                        {
                            if (roster[i].includes(user.id))
                            {
                                roster[i] = `${i+1}) `;
                            } 
                        }

                        if (!roster.join('').includes(editedEmbed.author.iconURL.split('avatars/')[1].split('/')[0]))
                        {
                            var i;
                            for (i = 0; i < roster.length; i++)
                            {
                                if (roster[i].includes('@'))
                                {
                                    break;
                                }
                            }
                            
                            if (roster.join('').includes('@'))
                            {
                                var newHost = message.guild.members.cache.find(m => m.id == roster[i].split('@')[1].split('>')[0]);

                                var colour = newHost.displayHexColor;
    
                                if (colour == '#000000')
                                {
                                    colour = '#99aab5';
                                }
    
                                editedEmbed.setAuthor(newHost.displayName, newHost.user.displayAvatarURL({ format: "png", dynamic: true }));
                                editedEmbed.setColor(colour);
                            }
                        }

                        roster = roster.join('\n');
            
                        editedEmbed.spliceFields(0, 1);
            
                        editedEmbed.addField('Roster', roster);

                        var displayName = message.guild.members.cache.get(user.id).displayName;
                        var description = editedEmbed.description.replace('\n', ' - ').replace(/[**]/g, '');
                        var scheduleID = message.id;

                        var schedule = `${displayName} **left** - ${description} - ${scheduleID}`;

                        sendLog(schedule, user, message.guild);
            
                        message.edit('', {embed: editedEmbed});
                    }
                }
                else if (message.embeds[0].footer.text.includes('~guide'))
                {
                    if (emoji.name == '➡' || emoji.name == '⬅')
                    {
                        reaction.users.remove(user);

                        const editedEmbed = new Discord.MessageEmbed(message.embeds[0]);

                        var footer = editedEmbed.footer.text;
                        var gallery = footer.split('~guide ').join('').split(' (')[0];
                        var page = parseInt(footer.split('(')[1].split('/')[0]);

                        if (gallery == 'wishes' || gallery == 'wish')
                        {
                            gallery = wishes;
                            footer = 'wishes';
                        }
                        else if (gallery == 'niobe' || gallery == 'niobelabs')
                        {
                            gallery = niobe;
                            footer = 'niobe';
                        }

                        if (emoji.name == '➡') // right
                        {
                            if (page == gallery.length)
                            {
                                page = 1;
                            }
                            else
                            {
                                page++;
                            }
                        }
                        else if (emoji.name == '⬅') // left
                        {
                            if (page == 1)
                            {
                                page = gallery.length;
                            }
                            else
                            {
                                page--;
                            }
                        }

                        var description = gallery[page-1][0];
                        var imageURL = gallery[page-1][1];
                        
                        editedEmbed.setDescription(description);

                        editedEmbed.setImage(imageURL);

                        editedEmbed.setFooter(`~guide ${footer} (${page}/${gallery.length})`);

                        message.edit(editedEmbed);
                    }
                }
            }
        }
    }
    
    // Upvote/Downvote system
    if (emoji.id == '594816363722309645')
    {
        if (user.bot) return;

        let downvote = message.reactions.cache.filter(r => r.emoji.id == '594816363533565991').array();
        
        if (downvote[0] != undefined)
        {
            downvote[0].users.remove(user);
        }
    }
    else if (emoji.id == '594816363533565991')
    {
        if (user.bot) return;

        let upvote = message.reactions.cache.filter(r => r.emoji.id == '594816363722309645').array();

        if (upvote[0] != undefined)
        {
            upvote[0].users.remove(user);
        }
    }

    // @roles reaction role
    if (message.id == '685996115367166059')
    {
        if (emoji.id == '592085760824442910')
        {
            if (member.roles.cache.some(r => r.id == '599755089908989953')) // pint
            {
                if (!member.roles.cache.some(r => r.id == '540565941977874434'))
                {
                    reaction.users.remove(user);
    
                    member.roles.add('540565941977874434');
    
                    var roleUpdate = `${member.displayName} **added role** - @roles`;

                    sendLog(roleUpdate, user, message.guild);

                    setTimeout(function()
                    {
                        if (member.roles.cache.some(r => r.id == '540565941977874434'))
                        {
                            member.roles.remove('540565941977874434');

                            roleUpdate = `${member.displayName} **removed role** - @roles`;

                            sendLog(roleUpdate, user, message.guild);
                        }
                    }, 120000)
                }
                else
                {
                    reaction.users.remove(user);
                    
                    member.roles.remove('540565941977874434');
    
                    var roleUpdate = `${member.displayName} **removed role** - @roles`;

                    sendLog(roleUpdate, user, message.guild);
                }
            }
            else
            {
                reaction.users.remove(user);
            }
        }
    }

    // @destiny2 reaction role
    if (message.id == '698383909355782194')
    {
        if (emoji.id == '538511232416612364')
        {
            if (!member.roles.cache.some(r => r.id == '698345563485372497'))
            {
                reaction.users.remove(user);

                member.roles.add('698345563485372497');

                var roleUpdate = `${member.displayName} **added role** - @guardian`;
                
                sendLog(roleUpdate, user, message.guild);
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('698345563485372497');

                var roleUpdate = `${member.displayName} **removed role** - @guardian`;
                
                sendLog(roleUpdate, user, message.guild);
            }
        }
    }

    // @lfg reaction role
    if (message.id == '698384221500211242')
    {
        if (emoji.id == '535644830408245249')
        {
            if (!member.roles.cache.some(r => r.id == '534925628680437783'))
            {
                reaction.users.remove(user);

                member.roles.add('534925628680437783');

                var roleUpdate = `${member.displayName} **added role** - @lfg`;
                
                sendLog(roleUpdate, user, message.guild);
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('534925628680437783');

                var roleUpdate = `${member.displayName} **removed role** - @lfg`;
                
                sendLog(roleUpdate, user, message.guild);
            }
        }
    }

    // @comp reaction role
    if (message.id == '698384962935717889')
    {
        if (emoji.id == '539648520832155648')
        {
            if (!member.roles.cache.some(r => r.id == '539645535754256387'))
            {
                reaction.users.remove(user);

                member.roles.add('539645535754256387');

                var roleUpdate = `${member.displayName} **added role** - @comp`;
                
                sendLog(roleUpdate, user, message.guild);
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('539645535754256387');

                var roleUpdate = `${member.displayName} **removed role** - @comp`;
                
                sendLog(roleUpdate, user, message.guild);
            }
        }
    }

    // @callofduty reaction role
    if (message.id == '749299967713214594')
    {
        if (emoji.id == '694640278266576968')
        {
            if (!member.roles.cache.some(r => r.id == '694647773060136981'))
            {
                reaction.users.remove(user);

                member.roles.add('694647773060136981');

                var roleUpdate = `${member.displayName} **added role** - @fng`;
                
                sendLog(roleUpdate, user, message.guild);
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('694647773060136981');

                var roleUpdate = `${member.displayName} **removed role** - @fng`;
                
                sendLog(roleUpdate, user, message.guild);
            }
        }
    }

    // @runescape reaction role
    if (message.id == '725042996915208374')
    {
        if (emoji.id == '724985145337315418')
        {
            if (!member.roles.cache.some(r => r.id == '724980000557629592'))
            {
                reaction.users.remove(user);

                member.roles.add('724980000557629592');

                var roleUpdate = `${member.displayName} **added role** - @lumbridge`;
                
                sendLog(roleUpdate, user, message.guild);
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('724980000557629592');

                var roleUpdate = `${member.displayName} **removed role** - @lumbridge`;
                
                sendLog(roleUpdate, user, message.guild);
            }
        }
    }

    // @runescape reaction role
    if (message.id == '725042996915208374')
    {
        if (emoji.id == '724985145337315418')
        {
            if (!member.roles.cache.some(r => r.id == '724980000557629592'))
            {
                reaction.users.remove(user);

                member.roles.add('724980000557629592');

                var roleUpdate = `${member.displayName} **added role** - @lumbridge`;
                
                sendLog(roleUpdate, user, message.guild);
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('724980000557629592');

                var roleUpdate = `${member.displayName} **removed role** - @lumbridge`;
                
                sendLog(roleUpdate, user, message.guild);
            }
        }
    }

    // @minecraft reaction role
    if (message.id == '800101427434750003')
    {
        if (emoji.id == '764714085262163978')
        {
            if (!member.roles.cache.some(r => r.id == '799797564437168128'))
            {
                reaction.users.remove(user);

                member.roles.add('799797564437168128');

                var roleUpdate = `${member.displayName} **added role** - @villager`;
                
                sendLog(roleUpdate, user, message.guild);
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('799797564437168128');

                var roleUpdate = `${member.displayName} **removed role** - @villager`;
                
                sendLog(roleUpdate, user, message.guild);
            }
        }
    }
});

client.on('message', async (message) =>
{
    var user = message.author;
    var msg = message.content.toLowerCase();

    // Bungie Notifications
    if ((user.id == '738808856146215023') && (message.guild.id == '534915212760055819'))
    {
        const mFilter = m => (m.author.id == '560533863290372097' && m.system == true);

        message.channel.messages.fetchPinned().then(pins =>
            {                
                message.channel.awaitMessages(mFilter, { max: 1, time : 10000 }).then( notif => notif.first().delete({ timeout: 10000 }));

                if (pins.size >= 50)
                {
                    pins.sort((pinA, pinB) => pinA.createdTimestamp - pinB.createdTimestamp).first().unpin().then( message.pin() );
                }
                else
                {
                    message.pin();
                }
            });
    }

    if (user.bot) return;

    // auto @lfg
    if (message.content.includes('<@&534925628680437783>'))
    {
        if (!message.member.roles.cache.some(r => r.id == '534925628680437783'))
        {
            message.member.roles.add('534925628680437783');

            var roleUpdate = `${message.member.displayName} **added role** - @lfg`;
                
            sendLog(roleUpdate, user, message.guild);
        }
    }

    // auto @comp
    if (message.content.includes('<@&539645535754256387>'))
    {
        if (!message.member.roles.cache.some(r => r.id == '539645535754256387'))
        {
            message.member.roles.add('539645535754256387');

            var roleUpdate = `${message.member.displayName} **added role** - @comp`;
                
            sendLog(roleUpdate, user, message.guild);
        }
    }

    // dm webhook
    if (message.channel.type == 'dm')
    {
        if (message.attachments.size > 0)
        {
            hahaDM.send(message.content, {
                username: `${message.author.tag} - ${message.author.id}`,
                avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true }),
                files: [message.attachments.first().url]
            });
        } else
        {
            hahaDM.send(message.content, {
                username: `${message.author.tag} - ${message.author.id}`,
                avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true })
            });
        }
    }

    // Discord Links
    if (msg.includes('discord.gg/' || 'discordapp.com/invite'))
    {
        if (message.guild.id === '534915212760055819')
        {
            if (user.tag != 'ando#0404')
            {
                message.delete();

                message.channel.send('**No Discord invite links allowed**').then(msg => msg.delete({ timeout: 10000 }));
                
                sendLog(msg, message.author, message.guild);
            }
        }
    }

    // Reddit Videos
    if (msg.includes('reddit.com'))
    {
        message.channel.startTyping();

        try
        {
            var words = msg.split(/ +/);
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

                    sendLog(err, client.user);
                })
                .on('end', function()
                {
                    var attachment = new Discord.MessageAttachment(`${dir}/${redditPostID}.mp4`, `${redditPostID}.mp4`);

                    message.channel.send({files: [attachment]})
                        .then(() =>
                        {
                            message.channel.stopTyping();

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
            message.channel.stopTyping();

            sendLog(e, client.user);
        }
    }

    if (msg.includes('🦀'))
    {
        message.react('🦀');
    }

    if (msg.includes('<a:crabrave:586918323149602816>'))
    {
        message.react('586918323149602816');
    }

    if (msg === 'thanks son')
    {
        if (user.tag === 'ando#0404')
        {
            message.channel.send('thanks dad');
        } 
        else
        {
            message.channel.send('im calling the police');
        }
        
        sendLog(msg, user, message.guild);
    }

    if (msg === 'b')
    {
        message.channel.send('b');
    }
});

client.login(token);