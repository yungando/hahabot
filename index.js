const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

const { prefix, token } = require('./config.json');

const { hahaDMID, hahaDMToken } = require('./webhooks/hahaDM.json');
const hahaDM = new Discord.WebhookClient(hahaDMID, hahaDMToken);

const { hahaLOGID, hahaLOGToken } = require('./webhooks/hahaLOG.json');
const hahaLOG = new Discord.WebhookClient(hahaLOGID, hahaLOGToken);

const { wishes, niobe } = require('./webhooks/galleries.json');

client.once('ready', () => 
{
    console.log('Ready!');
    client.user.setActivity('~help');
});

const events = 
{
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
};

client.on('message', message =>
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
        console.log(e);
    }
    finally
    {
        var name;

        if (message.channel.type == 'dm')
        {
            name = `${message.author.tag} - ${message.author.id}`;
        }
        else
        {
            name = `${message.member.displayName} - ${message.author.tag} - ${message.author.id}`;
        }

        hahaLOG.send(message.content, {
            username: name,
            avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true })
        });
    }
});

client.on('guildMemberRemove', member =>
{
    try
    {
        let tag = member.user.id;
        let guild = member.guild;

        guild.systemChannel.send(`<@${tag}> left the server.`);
    }
    catch (e)
    {
        
    }
});

client.on('guildMemberUpdate', async (oldMember, newMember) =>
{
    let guild = oldMember.guild;

    if (guild.id != '534915212760055819') return; // Pub Crawl

    if ((oldMember.premiumSinceTimestamp != null) && newMember.premiumSinceTimestamp == null)
    {
        guild.systemChannel.send(`<@${newMember.id}> unboosted the server.`);
    }
});

client.on('messageReactionAdd', async (reaction, user) =>
{
    if (user.bot) return;

    if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
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
                        
                        hahaLOG.send(schedule, {
                            username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                            avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                        });
            
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
                        
                        hahaLOG.send(schedule, {
                            username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                            avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                        });
            
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
    
                    hahaLOG.send(roleUpdate, {
                        username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                        avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                    });
                }
                else
                {
                    reaction.users.remove(user);
                    
                    member.roles.remove('540565941977874434');
    
                    var roleUpdate = `${member.displayName} **removed role** - @roles`;
    
                    hahaLOG.send(roleUpdate, {
                        username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                        avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                    });
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

                hahaLOG.send(roleUpdate, {
                    username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                    avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                });
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('698345563485372497');

                var roleUpdate = `${member.displayName} **removed role** - @guardian`;

                hahaLOG.send(roleUpdate, {
                    username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                    avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                });
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

                hahaLOG.send(roleUpdate, {
                    username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                    avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                });
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('534925628680437783');

                var roleUpdate = `${member.displayName} **removed role** - @lfg`;

                hahaLOG.send(roleUpdate, {
                    username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                    avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                });
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

                hahaLOG.send(roleUpdate, {
                    username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                    avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                });
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('539645535754256387');

                var roleUpdate = `${member.displayName} **removed role** - @comp`;

                hahaLOG.send(roleUpdate, {
                    username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                    avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                });
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

                hahaLOG.send(roleUpdate, {
                    username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                    avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                });
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('694647773060136981');

                var roleUpdate = `${member.displayName} **removed role** - @fng`;

                hahaLOG.send(roleUpdate, {
                    username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                    avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                });
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

                hahaLOG.send(roleUpdate, {
                    username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                    avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                });
            }
            else
            {
                reaction.users.remove(user);
                
                member.roles.remove('724980000557629592');

                var roleUpdate = `${member.displayName} **removed role** - @lumbridge`;

                hahaLOG.send(roleUpdate, {
                    username: `${message.guild.members.cache.find(m => m.id == user.id).displayName} - ${user.tag} - ${user.id}`,
                    avatarURL: user.displayAvatarURL({ format: "png", dynamic: true })
                });
            }
        }
    }
});

client.on('message', message =>
{
    var sender = message.author;
    var msg = message.content.toLowerCase();

    // Bungie Notifications
    if ((sender.id == '738808856146215023') && (message.guild.id == '534915212760055819'))
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

    if (sender.bot) return;

    // auto @lfg
    if (message.content.includes('<@&534925628680437783>'))
    {
        if (!message.member.roles.cache.some(r => r.id == '534925628680437783'))
        {
            message.member.roles.add('534925628680437783');

            var roleUpdate = `${message.member.displayName} **added role** - @lfg`;

            hahaLOG.send(roleUpdate, {
                username: `${message.guild.members.cache.find(m => m.id == message.member.id).displayName} - ${message.author.tag} - ${message.member.id}`,
                avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true })
            });
        }
    }

    // auto @comp
    if (message.content.includes('<@&539645535754256387>'))
    {
        if (!message.member.roles.cache.some(r => r.id == '539645535754256387'))
        {
            message.member.roles.add('539645535754256387');

            var roleUpdate = `${message.member.displayName} **added role** - @comp`;

            hahaLOG.send(roleUpdate, {
                username: `${message.guild.members.cache.find(m => m.id == message.member.id).displayName} - ${message.author.tag} - ${message.member.id}`,
                avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true })
            });
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
            if (sender.tag != 'ando#0404')
            {
                message.delete();
                message.channel.send('**No Discord invite links allowed**').then(msg => msg.delete({ timeout: 10000 }));

                hahaLOG.send(msg, {
                    username: `${message.member.displayName} - ${message.author.tag} - ${message.author.id}`,
                    avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true })
                });
            }
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
        if (sender.tag === 'ando#0404')
        {
            message.channel.send('thanks dad');
        } 
        else
        {
            message.channel.send('im calling the police');
        }

        hahaLOG.send(msg, {
            username: `${message.member.displayName} - ${message.author.tag} - ${message.author.id}`,
            avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true })
        });
    }

    if (msg === 'b')
    {
        message.channel.send('b');
    }
});

client.login(token);