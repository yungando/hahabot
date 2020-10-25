const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{
    /////////////////////////////////////////////
    var channelID;

    if (message.channel.type == 'dm')
    {
        message.author.send('**Day One command must be ran in a server**')

        return;
    }

    if (message.guild.id == '534915212760055819') // Pub Crawl
    {
        channelID = '769728197125341217';
    }
    else if (message.guild.id == '568227296767639552') // haha
    {
        channelID = '596138800774774824';
    }
    else
    {
        message.channel.send('**Day One command cannot run in this server**')
                        .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    var raidSchedules = message.guild.channels.cache.get(channelID);

    async function findMessage(message, raidID)
    {
        let channels = client.channels.cache.filter(c => c.id == channelID).array();

        for (let current of channels)
        {
          let target = await current.messages.fetch(raidID).catch((e) => { });
          if (target) return target;
        }
    }

    function addMembers(roster, tempPlayerIds)
    {
        var newPlayer;
        var newPlayers = [];

        if (!Array.isArray(tempPlayerIds) || !tempPlayerIds.length)
        {
            return roster;
        }
        
        for (let i = 0; i < tempPlayerIds.length; i++)
        {
            for (let j = i+1; j < tempPlayerIds.length; j++)
            {
                if (tempPlayerIds[i] == tempPlayerIds[j])
                {
                    tempPlayerIds.splice(j, 1);
                    j--;
                }
            }
        }

        for (let i = 0; i < tempPlayerIds.length; i++)
        {
            try
            {
                newPlayer = message.guild.members.cache.get(tempPlayerIds[i]);
                newPlayers.push(newPlayer.id);                            
            }
            catch
            {
                
            }
        }

        if (!Array.isArray(newPlayers) || !newPlayers.length)
        {
            return roster;
        }

        roster = roster.split('\n');

        for (let i = 0; i < newPlayers.length; i++)
        {
            for (let j = 0; j < roster.length; j++)
            {
                if (roster[j].includes(newPlayers[i]))
                {
                    newPlayers.splice(i, 1);
                    i--;
                }
            }
        }

        for (let i = 0; i < roster.length; i++)
        {
            if (!roster[i].includes('@'))
            {
                if (!Array.isArray(newPlayers) || !newPlayers.length)
                {
                    break;
                }
                else
                {
                    roster[i] = `${i+1}) <@${newPlayers.shift()}>`;
                }
            }
        }
        
        roster = roster.join('\n');

        return roster;
    }

    function inRoster(roster, memberID)
    {
        return roster.includes(memberID);
    }
    /////////////////////////////////////////////

    var [action, ...restArgs] = args;

    if (action == undefined)
    {
        message.channel.send('**Please supply a valid action**')
                        .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    action = action.toLowerCase();

    if (action == 'create')////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var tempAdd = [];

        if (restArgs.includes('&&'))
        {
            restArgs = restArgs.join(' ');
            restArgs = restArgs.split('&& ');

            tempAdd = restArgs[1];

            restArgs = restArgs[0].split(/ +/);

            if (restArgs.includes('&&'))
            {
                message.channel.send('**The \`&&\` opperand is for adding players to a day one schedule only, and cannot be used more than once or in a description.**')
                            .then( msg => msg.delete({ timeout: 10000 }));

                message.delete();

                return;
            }
        }

        var roster = [`1) <@${message.author.id}>`]

        for (var i = 1; i < 6; i++)
        {
            roster.push(`${i+1}) `);
        }

        roster = roster.join('\n');

        var activity = 'Day One Raid';
        var time = '1pm EST, Saturday 21st November';

        restArgs = restArgs.join(' ');

        if (restArgs.length != 0)
        {
            description = restArgs;
        }
        else
        {
            description = '';
        }

        if (tempAdd.length != 0)
        {
            var tempPlayerIds = tempAdd.split(/ +/);

            roster = addMembers(roster, tempPlayerIds);
        }
        
        let colour = message.member.displayHexColor;

        if (colour == '#000000')
        {
            colour = '#99aab5';
        }
        
        const raidEmbed = new Discord.MessageEmbed()
        .setAuthor(message.member.displayName, message.author.displayAvatarURL({ format: "png", dynamic: true }))
        .setColor(colour)
        .setDescription(`**${activity}** - ${time}\n${description}`)
        .addField('Roster', roster, false)
        .setFooter('#day-one')
        .setThumbnail('https://cdn.discordapp.com/attachments/569081839134965771/599893637253431326/darkness5.png');

        activity = '';

        if ((message.guild.id == '534915212760055819') && (!message.member.roles.cache.some(r => r.id == '534925628680437783')))
        {
            message.member.roles.add('534925628680437783');

            var roleUpdate = `${message.member.displayName} **added role** - @lfg`;

            hahaLOG.send(roleUpdate, {
                username: `${message.guild.members.cache.find(m => m.id == message.member.id).displayName} - ${message.author.tag} - ${message.member.id}`,
                avatarURL: message.author.displayAvatarURL({ format: "png", dynamic: true })
            });
        }

        raidSchedules.send(activity, {embed: raidEmbed})
                                        .then(function (message) {
                                                message.edit(activity, {embed: raidEmbed.setFooter(`#day-one - ${message.id}`)})
                                                                });
    }
    else if (action == 'add')//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [raidID, ...tempPlayerIds] = restArgs;

        if (isNaN(raidID))
        {
            message.channel.send('**Please supply a valid day one schedule ID to add players to**')
                            .then( msg => msg.delete({ timeout: 10000 }));
                        
            message.delete();

            return;
        }

        findMessage(message, raidID)
            .then(raid => {

            var oldEmbed = raid.embeds[0];

            var roster = oldEmbed.fields[0].value;

            var raidIconID = oldEmbed.author.iconURL.split('avatars/')[1].split('/')[0];

            if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (raidIconID == message.author.displayAvatarURL({ format: "png", dynamic: true })))
            {
                if (!Array.isArray(tempPlayerIds) || !tempPlayerIds.length)
                {
                    message.channel.send('**You didn\'t include any user ID\'s to add to the day one schedule**')
                                    .then( msg => msg.delete({ timeout: 10000 }));

                    message.delete();

                    return;
                }

                var newRoster = addMembers(roster, tempPlayerIds);
        
                oldEmbed.spliceFields(0, 1);

                const editedEmbed = new Discord.MessageEmbed(oldEmbed);
        
                editedEmbed.addField('Roster', newRoster);

                var rosterDiff = newRoster.replace(/[^@]/g, '').length - roster.replace(/[^@]/g, '').length;

                if (rosterDiff > 0)
                {
                    raid.edit(editedEmbed);

                    message.channel.send(`**Successfully Added \`${rosterDiff}\` player(s) to the day one schedule roster**`)
                                    .then(msg => msg.delete({ timeout: 10000 }));
                }
            }
            else
            {
                message.channel.send('**You do not have permission to add players to this day one schedule**')
                                .then( msg => msg.delete({ timeout: 10000 }));
            }
        }).catch(error => message.channel.send('**Please supply a valid day one schedule ID to add players to**')
                                          .then( msg => msg.delete({ timeout: 10000 })));
    }
    else if (action == 'remove')//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [raidID, ...playerIDs] = restArgs;

        if (isNaN(raidID))
        {
            message.channel.send('**Please a supply a valid day one schedule ID to remove players from**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        findMessage(message, raidID)
            .then(raid => {

                var oldEmbed = raid.embeds[0];

                var roster = oldEmbed.fields[0].value;

                var raidIconID = oldEmbed.author.iconURL.split('avatars/')[1].split('/')[0];

                if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (raidIconID == message.author.displayAvatarURL({ format: "png", dynamic: true })))
                {
                    if (!Array.isArray(playerIDs) || !playerIDs.length) 
                    {
                        message.channel.send('**Please supply valid player IDs to remove them from a day one schedule**')
                                            .then( msg => msg.delete({ timeout: 10000 }));

                        message.delete();

                        return;
                    }

                    var oldRoster = roster;
                    var roster = roster.split('\n');

                    for (var j = 0; j < playerIDs.length; j++)
                    {
                        for (var i = 0; i < roster.length; i++)
                        {
                            if (roster[i].includes(playerIDs[j]))
                            {
                                if ((playerIDs[j] != '') && (playerIDs[j] != ' '))
                                {
                                    roster[i] = `${i+1}) `;
                                }
                            }
                        }
                    }

                    const editedEmbed = new Discord.MessageEmbed(oldEmbed);

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
                    
                    var newRoster = roster.join('\n');
            
                    editedEmbed.spliceFields(0, 1);
            
                    editedEmbed.addField('Roster', newRoster);

                    var rosterDiff = oldRoster.replace(/[^@]/g, '').length - newRoster.replace(/[^@]/g, '').length;

                    if (rosterDiff > 0)
                    {
                        raid.edit(editedEmbed);

                        message.channel.send(`**Successfully removed \`${rosterDiff}\` player(s) from the day one schedule roster**`)
                                        .then(msg => msg.delete({ timeout: 10000 }));
                    }
                }
                else
                {
                    message.channel.send('**You do not have permission to remove players from this day one schedule**')
                                    .then(msg => msg.delete({ timeout: 10000 }));
                }
        })
        .catch(error => message.channel.send('**Please supply a valid day one schedule ID to remove players from**')
                                        .then( msg => msg.delete({ timeout: 10000 })));
    }
    else if (action == 'edit')//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [raidID, field, ...restArgs] = restArgs;

        field = field.toLowerCase();
        let fieldInput = restArgs.join(' ');

        if (isNaN(raidID))
        {
            message.channel.send('**Please supply a valid day one schedule ID to edit**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        findMessage(message, raidID)
                    .then(raid => {

                        let oldEmbed = raid.embeds[0];
                
                        let roster = oldEmbed.fields[0].value;

                        var raidIconID = oldEmbed.author.iconURL.split('avatars/')[1].split('/')[0];
                        
                        if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (raidIconID == message.author.displayAvatarURL({ format: "png", dynamic: true })))
                        {
                            if (field == 'time')
                            {
                                let description = oldEmbed.description.split(' - ');

                                let time = description[1].split('\n');

                                time[0] = fieldInput;

                                time = time.join('\n');

                                description[1] = time;

                                const editedEmbed = new Discord.MessageEmbed(oldEmbed);

                                editedEmbed.setDescription(description.join(' - '));

                                raid.edit(editedEmbed);

                                message.channel.send('**Day one schedule time successfully edited**')
                                            .then( msg => msg.delete({ timeout: 10000 }));
                            }
                            else if ((field == 'desc') || (field == 'description'))
                            {
                                let description = oldEmbed.description.split('\n');

                                description[1] = fieldInput;

                                const editedEmbed = new Discord.MessageEmbed(oldEmbed);

                                editedEmbed.setDescription(description.join('\n'));

                                raid.edit(editedEmbed);

                                message.channel.send('**Day one schedule description successfully edited**')
                                            .then( msg => msg.delete({ timeout: 10000 }));
                            }
                            else
                            {
                                message.channel.send('**Please supply a valid field to edit**')
                                                .then( msg => msg.delete({ timeout: 10000 }));

                                message.delete();

                                return;
                            }
                        }
                        else
                        {
                            message.channel.send('**You do not have permission to edit this day one schedule**')
                                            .then( msg => msg.delete({ timeout: 10000 }));
                        }
                    })
                    .catch(error => message.channel.send('**Please supply a valid day one schedule ID to edit**')
                                                    .then( msg => msg.delete({ timeout: 10000 })))
    }
    else if (action == 'alert')//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [raidID, ...restArgs] = restArgs;
        var reply = restArgs.join(' ');

        if (isNaN(raidID))
        {
            message.channel.send(`**Could not alert roster. You didn't include a message ID.**`)
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        findMessage(message, raidID)
            .then(raid => {

                var raidEmbed = raid.embeds[0];

                var roster = raidEmbed.fields[0].value;

                if ((message.member.roles.cache.some(r => r.name === 'bouncer') || (inRoster(roster, message.author.id))))
                {
                    var quoteeUser = message.author;
                    var quoteeGuildMember = message.member;

                    let color = quoteeGuildMember.displayHexColor;

                    if (color == '#000000')
                    {
                        color = '#99aab5';
                    }

                    reply = reply.split('- ').join('');

                    const embed = new Discord.MessageEmbed()
                    .setAuthor(quoteeGuildMember.displayName, quoteeUser.displayAvatarURL({ format: "png", dynamic: true }))
                    .setColor(color)
                    .setDescription(reply)
                    .setFooter(`in #${message.channel.name}`)
                    .setTimestamp(message.createdTimestamp);
                    
                    message.channel.send(roster, {embed: embed});
                }
                else
                {
                    message.channel.send('**You do not have permission to alert this day one schedule roster**')
                                    .then( msg => msg.delete({ timeout: 10000 }));
                }
            })
            .catch(error => message.channel.send('**Could not alert roster. The message ID was invalid**')
                                            .then( msg => msg.delete({ timeout: 10000 })))
    }
    else if (action == 'delete')////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [raidID, ...restArgs] = restArgs;
        var reply = restArgs.join(' ');

        var oldSchedules = client.channels.cache.get('597651951609577472');

        if (isNaN(raidID))
        {
            message.channel.send('**Please supply a valid schedule ID to delete**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }
        
        findMessage(message, raidID)
            .then(schedule => {

                let raidEmbed = schedule.embeds[0];

                let roster = raidEmbed.fields[0].value;

                const deletedSchedule = new Discord.MessageEmbed(raidEmbed)
                
                if (message.member.roles.cache.some(r => r.name === 'bouncer'))
                {
                    if (reply.length != 0)
                    {
                        var quoteeUser = message.author;
                        var quoteeGuildMember = message.member;
    
                        let color = quoteeGuildMember.displayHexColor;
    
                        if (color == '#000000')
                        {
                            color = '#99aab5';
                        }

                        reply = reply.split('- ').join('');
    
                        const embed = new Discord.MessageEmbed()
                        .setAuthor(quoteeGuildMember.displayName, quoteeUser.displayAvatarURL({ format: "png", dynamic: true }))
                        .setColor(color)
                        .setDescription(reply)
                        .setFooter(`in #${message.channel.name}`)
                        .setTimestamp(message.createdTimestamp);
                        
                        message.channel.send(`**Day one schedule successfully deleted**\n${roster}`, {embed: embed});

                        oldSchedules.send(deletedSchedule);
    
                        schedule.delete();
                    }
                    else
                    {
                        message.channel.send('**Day one schedule successfully deleted**')
                                    .then( msg => msg.delete({ timeout: 10000 }));

                        oldSchedules.send(deletedSchedule);

                        schedule.delete();
                    }
                }
                else
                {
                    message.channel.send('**You do not have permission to delete this day one schedule**')
                                        .then( msg => msg.delete({ timeout: 10000 }));
                }
            })
            .catch(error => message.channel.send('**Please supply a valid day one schedule ID to delete**')
                                            .then( msg => msg.delete({ timeout: 10000 }))
        )
    }
    else if (action == 'transfer')////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [raidID, ...tempPlayerId] = restArgs;

        if (isNaN(raidID))
        {
            message.channel.send('**Please supply a valid day one schedule ID to transfer ownership**')
                            .then( msg => msg.delete({ timeout: 10000 }));
                        
            message.delete();

            return;
        }

        findMessage(message, raidID)
            .then(raid => {

            var oldEmbed = raid.embeds[0];

            var roster = oldEmbed.fields[0].value;
            
            var raidIconID = oldEmbed.author.iconURL.split('avatars/')[1].split('/')[0];

            if (message.member.roles.cache.some(r => r.name === 'bouncer'))
            {
                if (!Array.isArray(tempPlayerId) || !tempPlayerId.length)
                {
                    message.channel.send('**You didn\'t include any user ID\'s to add to the schedule**')
                                    .then( msg => msg.delete({ timeout: 10000 }));

                    message.delete();

                    return;
                }

                if (inRoster(roster, tempPlayerId))
                {
                    var newHost = message.guild.members.cache.find(m => m.id == tempPlayerId);

                    const editedEmbed = new Discord.MessageEmbed(oldEmbed);

                    var colour = newHost.displayHexColor;

                    if (colour == '#000000')
                    {
                        colour = '#99aab5';
                    }

                    editedEmbed.setAuthor(newHost.displayName, newHost.user.displayAvatarURL({ format: "png", dynamic: true }));
                    editedEmbed.setColor(colour);
            
                    raid.edit(editedEmbed);

                    message.channel.send(`**Successfully transfered schedule ownership to** ${newHost.displayName}`)
                                    .then( msg => msg.delete({ timeout: 10000 }));
                }
                else
                {
                    message.channel.send('**Please supply a valid member ID**')
                                .then( msg => msg.delete({ timeout: 10000 }));

                    message.delete();

                    return;
                }
            }
            else
            {
                message.channel.send('**You do not have permission to add players to this schedule**')
                                .then( msg => msg.delete({ timeout: 10000 }));

                message.delete();

                return;
            }
        }).catch(error => message.channel.send('**Please supply a valid schedule ID to add players to**')
                                          .then( msg => msg.delete({ timeout: 10000 })));
    }
    else if (action == 'update')////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        if (message.author.tag != 'ando#0404') return;

        var [raidID, ...restArgs] = restArgs;
        var reply = restArgs.join(' ');

        var oldSchedules = client.channels.cache.get('597651951609577472');

        if (isNaN(raidID))
        {
            message.channel.send('**Please supply a valid schedule ID to delete**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }
        
        findMessage(message, raidID)
            .then(schedule =>
            {
                let raidEmbed = schedule.embeds[0];

                raidEmbed.setDescription(schedule.embeds[0].description.replace('\u000D', '\n'));

                raidEmbed.spliceFields(0, 10, [{ name : schedule.embeds[0].fields[0].name, value : schedule.embeds[0].fields[0].value.split('\u000D').join('\n') }]);

                schedule.edit(raidEmbed);

                message.channel.send('**Raid Schedule successfully updated**')
                            .then( msg => msg.delete({ timeout: 10000 }));
            });
    }
    else
    {
        message.channel.send('**Please supply a valid action**')
        .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    message.delete();
};