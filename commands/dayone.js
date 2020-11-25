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

    function addMembers(roster, tempPlayerIds)///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var newPlayer;
        var newPlayers = [];

        for (let i = 0; i < tempPlayerIds.length; i++)
        {
            if (isNaN(tempPlayerIds[i]))
            {
                tempPlayerIds.splice(i, 1);
                i--;
            }
        }

        if ((!Array.isArray(tempPlayerIds)) || (!tempPlayerIds.length) || (tempPlayerIds.length == 0))
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
        
        const schedule = new Discord.MessageEmbed()
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

        raidSchedules.send(activity, {embed: schedule})
                                        .then(function (message) {
                                                message.edit(activity, {embed: schedule.setFooter(`#day-one - ${message.id}`)})
                                                                });
    }
    else if (action == 'add')//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [scheduleID, ...tempPlayerIds] = restArgs;

        if (isNaN(scheduleID))
        {
            message.channel.send('**Please supply a valid day one schedule ID to add players to**')
                            .then( msg => msg.delete({ timeout: 10000 }));
                        
            message.delete();

            return;
        }

        if (!Array.isArray(tempPlayerIds) || !tempPlayerIds.length)
        {
            message.channel.send('**You didn\'t include any user ID\'s to add to the day one schedule**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        findMessage(message, scheduleID)
            .then(schedule => {

            const editedEmbed = new Discord.MessageEmbed(schedule.embeds[0]);

            var roster = editedEmbed.fields[0].value;
            
            var scheduleIconID = editedEmbed.author.iconURL.split('avatars/')[1].split('/')[0];

            if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (scheduleIconID == message.author.id))
            {
                var newRoster = addMembers(roster, tempPlayerIds)

                var rosterDiff = newRoster.replace(/[^@]/g, '').length - roster.replace(/[^@]/g, '').length;

                if (rosterDiff > 0)
                {
                    editedEmbed.spliceFields(0, 1);
            
                    editedEmbed.addField('Roster', newRoster);

                    schedule.edit(editedEmbed);

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
        var [scheduleID, ...playerIDs] = restArgs;

        if (isNaN(scheduleID))
        {
            message.channel.send('**Please a supply a valid day one schedule ID to remove players from**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        if (!Array.isArray(playerIDs) || !playerIDs.length) 
        {
            message.channel.send('**Please supply valid player IDs to remove them from a schedule**')
                                .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        findMessage(message, scheduleID)
            .then(schedule => {

                const editedEmbed = new Discord.MessageEmbed(schedule.embeds[0]);

                var roster = editedEmbed.fields[0].value;
                
                var scheduleIconID = editedEmbed.author.iconURL.split('avatars/')[1].split('/')[0];

                if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (scheduleIconID == message.author.id))
                {
                    var newRoster = roster.split('\n');

                    for (var j = 0; j < playerIDs.length; j++)
                    {
                        for (var i = 0; i < newRoster.length; i++)
                        {
                            if (newRoster[i].includes(playerIDs[j]))
                            {
                                if ((playerIDs[j] != '') && (playerIDs[j] != ' '))
                                {
                                    newRoster[i] = `${i+1}) `;
                                }
                            }
                        }
                    }

                    if (!newRoster.join('').includes(editedEmbed.author.iconURL.split('avatars/')[1].split('/')[0]))
                    {
                        var i;
                        for (i = 0; i < newRoster.length; i++)
                        {
                            if (newRoster[i].includes('@'))
                            {
                                break;
                            }
                        }
                        
                        if (newRoster.join('').includes('@'))
                        {
                            var newHost = message.guild.members.cache.find(m => m.id == newRoster[i].split('@')[1].split('>')[0]);

                            var colour = newHost.displayHexColor;

                            if (colour == '#000000')
                            {
                                colour = '#99aab5';
                            }

                            editedEmbed.setAuthor(newHost.displayName, newHost.user.displayAvatarURL({ format: "png", dynamic: true }));
                            editedEmbed.setColor(colour);
                        }
                    }
                    
                    var newRoster = newRoster.join('\n');

                    var rosterDiff = roster.replace(/[^@]/g, '').length - newRoster.replace(/[^@]/g, '').length;

                    if (rosterDiff > 0)
                    {            
                        editedEmbed.spliceFields(0, 1);
            
                        editedEmbed.addField('Roster', newRoster);

                        schedule.edit(editedEmbed);

                        message.channel.send(`**Successfully removed \`${rosterDiff}\` player(s) from the schedule roster**`)
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
        var [scheduleID, field, ...restArgs] = restArgs;

        field = field.toLowerCase();
        let fieldInput = restArgs.join(' ');

        if (isNaN(scheduleID))
        {
            message.channel.send('**Please supply a valid day one schedule ID to edit**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        findMessage(message, scheduleID)
            .then(schedule => {

            const editedEmbed = new Discord.MessageEmbed(schedule.embeds[0]);

            var scheduleIconID = editedEmbed.author.iconURL.split('avatars/')[1].split('/')[0];

            if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (scheduleIconID == message.author.id))
            {
                if (field == 'time')
                {
                    var description = editedEmbed.description.split(' - ');

                    var time = description[1].split('\n');

                    time[0] = fieldInput;

                    time = time.join('\n');

                    description[1] = time;

                    editedEmbed.setDescription(description.join(' - '));

                    schedule.edit(editedEmbed);

                    message.channel.send('**Schedule time successfully edited**')
                                .then( msg => msg.delete({ timeout: 10000 }));
                }
                else if ((field == 'desc') || (field == 'description'))
                {
                    var description = editedEmbed.description.split('\n');

                    description[1] = fieldInput;

                    editedEmbed.setDescription(description.join('\n'));

                    schedule.edit(editedEmbed);

                    message.channel.send('**Schedule description successfully edited**')
                                .then( msg => msg.delete({ timeout: 10000 }));
                }
                else
                {
                    message.channel.send('**Please supply a valid schedule field to edit**')
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
        var [scheduleID, ...alert] = restArgs;

        if (isNaN(scheduleID))
        {
            message.channel.send(`**Could not alert roster. You didn't include a message ID.**`)
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        findMessage(message, scheduleID)
            .then(schedule => {

                const editedEmbed = new Discord.MessageEmbed(schedule.embeds[0]);

                var roster = editedEmbed.fields[0].value;

                if ((message.member.roles.cache.some(r => r.name === 'bouncer') || (inRoster(roster, message.author.id))))
                {
                    if (alert[0] == '-')
                    {
                        alert.shift();
                    }

                    alert = alert.join(' ');

                    var quoteeUser = message.author;
                    var quoteeGuildMember = message.member;

                    let color = quoteeGuildMember.displayHexColor;

                    if (color == '#000000')
                    {
                        color = '#99aab5';
                    }

                    const alertEmbed = new Discord.MessageEmbed()
                        .setAuthor(quoteeGuildMember.displayName, quoteeUser.displayAvatarURL({ format: "png", dynamic: true }))
                        .setColor(color)
                        .setDescription(alert)
                        .setFooter(`in #${message.channel.name}`)
                        .setTimestamp(message.createdTimestamp);
                    
                    message.channel.send(roster, {embed: alertEmbed});
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
        var [scheduleID, ...alert] = restArgs;

        if (isNaN(scheduleID))
        {
            message.channel.send('**Please supply a valid schedule ID to delete**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }
        
        findMessage(message, scheduleID)
            .then(schedule => {

                if (message.member.roles.cache.some(r => r.name === 'bouncer'))
                {
                    const deletedSchedule = new Discord.MessageEmbed(schedule.embeds[0]);
                    
                    var oldSchedules = client.channels.cache.get('597651951609577472');

                    if (alert[0] == '-')
                    {
                        alert.shift();
                    }

                    alert = alert.join(' ');

                    if (alert.length != 0)
                    {
                        var roster = deletedSchedule.fields[0].value;

                        var quoteeUser = message.author;
                        var quoteeGuildMember = message.member;
    
                        let color = quoteeGuildMember.displayHexColor;
    
                        if (color == '#000000')
                        {
                            color = '#99aab5';
                        }
    
                        const embed = new Discord.MessageEmbed()
                        .setAuthor(quoteeGuildMember.displayName, quoteeUser.displayAvatarURL({ format: "png", dynamic: true }))
                        .setColor(color)
                        .setDescription(alert)
                        .setFooter(`in #${message.channel.name}`)
                        .setTimestamp(message.createdTimestamp);
                        
                        message.channel.send(`**Schedule successfully deleted**\n${roster}`, {embed: embed});
                    }
                    else
                    {
                        message.channel.send('**Schedule successfully deleted**')
                                    .then( msg => msg.delete({ timeout: 10000 }));
                    }

                    oldSchedules.send(deletedSchedule);

                    schedule.delete();
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
        var [scheduleID, tempPlayerId, ...restArgs] = restArgs;

        if (isNaN(scheduleID))
        {
            message.channel.send('**Please supply a valid day one schedule ID to transfer ownership**')
                            .then( msg => msg.delete({ timeout: 10000 }));
                        
            message.delete();

            return;
        }

        if (!Array.isArray(tempPlayerId) || !tempPlayerId.length)
        {
            message.channel.send('**Please supply a valid user ID to transfer ownership**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        findMessage(message, scheduleID)
            .then(schedule => {

                const editedEmbed = new Discord.MessageEmbed(schedule.embeds[0]);

                var roster = editedEmbed.fields[0].value;

                if (message.member.roles.cache.some(r => r.name === 'bouncer'))
                {
                    if (inRoster(roster, tempPlayerId))
                    {
                        var newHost = message.guild.members.cache.find(m => m.id == tempPlayerId);
    
                        var colour = newHost.displayHexColor;
    
                        if (colour == '#000000')
                        {
                            colour = '#99aab5';
                        }
    
                        editedEmbed.setAuthor(newHost.displayName, newHost.user.displayAvatarURL({ format: "png", dynamic: true }));
                        editedEmbed.setColor(colour);
                
                        schedule.edit(editedEmbed);
    
                        message.channel.send(`**Successfully transfered schedule ownership to** ${newHost.displayName}`)
                                        .then( msg => msg.delete({ timeout: 10000 }));
                    }
                    else
                    {
                        message.channel.send('**Please supply a valid schedule ID to transfer ownership**')
                                    .then( msg => msg.delete({ timeout: 10000 }));
                    }
                }
            else
            {
                message.channel.send('**You do not have permission to add players to this schedule**')
                                .then( msg => msg.delete({ timeout: 10000 }));
            }
        }).catch(error => message.channel.send('**Please supply a valid schedule ID to add players to**')
                                          .then( msg => msg.delete({ timeout: 10000 })));
    }
    else
    {
        message.channel.send('**Please supply a valid action**')
        .then( msg => msg.delete({ timeout: 10000 }));
    }

    message.delete();
};