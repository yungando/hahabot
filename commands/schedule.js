const Discord = require('discord.js');

exports.run = (client, message, args, tools) =>
{
    /////////////////////////////////////////////
    var channelID;

    if (message.channel.type == 'dm')
    {
        message.author.send('**Schedule command must be ran in a server**')

        return;
    }

    if (message.guild.id == '534915212760055819') // Pub Crawl
    {
        channelID = '593896171291017221';
    }
    else if (message.guild.id == '568227296767639552') // haha
    {
        channelID = '596138800774774824';
    }
    else if (message.guild.id == '80507177311145984') // Arm
    {
        channelID = '330551688500871168';
    }
    else
    {
        message.channel.send('**Schedule command cannot run in this server**')
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
          let target = await current.messages.fetch(raidID).catch((e) => { console.error(e) });
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
                error => console.log(error);
            }
        }

        if (!Array.isArray(newPlayers) || !newPlayers.length)
        {
            return roster;
        }

        roster = roster.split('\u000D');

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
        
        roster = roster.join('\u000D');

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
        var [spots, activity, ...restArgs] = restArgs;

        var fullRaid = false;
        var fullTime = false;
        
        var time;
        var description;

        var attemptActivity = [activity];
        var attemptTime = [];

        var tempAdd = [];

        if (restArgs.includes('&&'))
        {
            restArgs = restArgs.join(' ');
            restArgs = restArgs.split('&& ');

            tempAdd = restArgs[1];

            restArgs = restArgs[0].split(/ +/);

            if (restArgs.includes('&&'))
            {
                message.channel.send('**The \`&&\` opperand is for adding players to a schedule only, and cannot be used more than once or in a description.**')
                            .then( msg => msg.delete({ timeout: 10000 }));

                message.delete();

                return;
            }
        }

        if (isNaN(spots))
        {
            message.channel.send('**Please supply a number of spots for the activity schedule**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        if ((spots > 12) || (spots < 1))
        {
            message.channel.send('**Number of spots on a schedule must be between 1 and 12**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        var roster = [`1) <@${message.author.id}>`]

        for (var i = 1; i < spots; i++)
        {
            roster.push(`${i+1}) `);
        }

        roster = roster.join('\u000D');

        while (!fullRaid)
        {
            if (restArgs.length == 0)
            {
                message.channel.send('**Please supply a time for the scheduled activity**')
                                .then( msg => msg.delete({ timeout: 10000 }));
                            
                message.delete();

                return;
            }
            else if (restArgs[0] == '-')
            {
                restArgs.shift();
                fullRaid = true;
            }
            else
            {
                attemptActivity.push(restArgs.shift());
                activity = attemptActivity.join(' ');
                attemptActivity = [activity];
            }
        }

        while (!fullTime)
        {
            if ((restArgs[0] == '-')  || (restArgs.length == 0))
            {
                restArgs.shift();
                fullTime = true;
            }
            else
            {
                attemptTime.push(restArgs.shift());
                time = attemptTime.join(' ');
                attemptTime = [time];
            }
        }

        activity = activity.split('- ').join('');

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
        .setAuthor(message.member.displayName, message.author.avatarURL({ format: "png", dynamic: true }))
        .setColor(colour)
        .setDescription(`**${activity}** - ${time}\u000D${description}`)
        .addField('Roster', roster, false)
        .setFooter('#raid-schedules')
        .setThumbnail('https://cdn.discordapp.com/attachments/569081839134965771/599893637253431326/darkness5.png');

        if (roster.replace(/[^@]/g, '').length == 6)
        {
            activity = '';
        }
        else
        {
            activity = `${activity} - <@&534925628680437783>`;
        }

        raidSchedules.send(activity, {embed: raidEmbed})
                                        .then(function (message) {
                                                message.react('593898113626800129')
                                        .then(() => 
                                                message.react('593898113639383040'))
                                        .then(() => 
                                                message.edit(activity, {embed: raidEmbed.setFooter(`#raid-schedules - ${message.id}`)}))
                                                                });
    }
    else if (action == 'add')//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [raidID, ...tempPlayerIds] = restArgs;

        if (isNaN(raidID))
        {
            message.channel.send('**Please supply a valid schedule ID to add players to**')
                            .then( msg => msg.delete({ timeout: 10000 }));
                        
            message.delete();

            return;
        }

        findMessage(message, raidID)
            .then(raid => {

            var oldEmbed = raid.embeds[0];

            var roster = oldEmbed.fields[0].value;

            if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (inRoster(roster, message.author.id)))
            {
                if (!Array.isArray(tempPlayerIds) || !tempPlayerIds.length)
                {
                    message.channel.send('**You didn\'t include any user ID\'s to add to the schedule**')
                                    .then( msg => msg.delete({ timeout: 10000 }));

                    message.delete();

                    return;
                }

                var newRoster = addMembers(roster, tempPlayerIds);
        
                oldEmbed.fields = [];

                const editedEmbed = new Discord.MessageEmbed(oldEmbed);
        
                editedEmbed.addField('Roster', newRoster);

                var rosterDiff = newRoster.replace(/[^@]/g, '').length - roster.replace(/[^@]/g, '').length;

                if (rosterDiff > 0)
                {
                    raid.edit(editedEmbed);

                    message.channel.send(`**Successfully Added \`${rosterDiff}\` player(s) to the schedule roster**`)
                                    .then(msg => msg.delete({ timeout: 10000 }));
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
    else if (action == 'remove')//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [raidID, ...playerIDs] = restArgs;

        if (isNaN(raidID))
        {
            message.channel.send('**Please a supply a valid schedule ID to remove players from**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        findMessage(message, raidID)
            .then(raid => {

                var oldEmbed = raid.embeds[0];

                var roster = oldEmbed.fields[0].value;

                if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (inRoster(roster, message.author.id)))
                {
                    if (!Array.isArray(playerIDs) || !playerIDs.length) 
                    {
                        message.channel.send('**Please supply valid player IDs to remove them from a schedule**')
                                            .then( msg => msg.delete({ timeout: 10000 }));

                        message.delete();

                        return;
                    }

                    var oldRoster = roster;
                    var roster = roster.split('\u000D');

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

                            editedEmbed.setAuthor(newHost.displayName, newHost.user.avatarURL({ format: "png", dynamic: true }));
                            editedEmbed.setColor(colour);
                        }
                    }
                    
                    var newRoster = roster.join('\u000D');
            
                    editedEmbed.fields = [];
            
                    editedEmbed.addField('Roster', newRoster);

                    var rosterDiff = oldRoster.replace(/[^@]/g, '').length - newRoster.replace(/[^@]/g, '').length;

                    if (rosterDiff > 0)
                    {
                        raid.edit(editedEmbed);

                        message.channel.send(`**Successfully removed \`${rosterDiff}\` player(s) from the schedule roster**`)
                                        .then(msg => msg.delete({ timeout: 10000 }));
                    }
                }
                else
                {
                    message.channel.send('**You do not have permission to remove players from this schedule**')
                                    .then(msg => msg.delete({ timeout: 10000 }));
                }
        })
        .catch(error => message.channel.send('**Please b supply a valid schedule ID to remove players from**')
                                        .then( msg => msg.delete({ timeout: 10000 })));
    }
    else if (action == 'edit')//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [raidID, field, ...restArgs] = restArgs;

        field = field.toLowerCase();
        let fieldInput = restArgs.join(' ');

        if (isNaN(raidID))
        {
            message.channel.send('**Please supply a valid raid ID to edit**')
                            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        findMessage(message, raidID)
                    .then(raid => {

                        let oldEmbed = raid.embeds[0];

                        var raidIconID = oldEmbed.author.iconURL.split('avatars/')[1].split('/')[0];
                        
                        if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (raidIconID == message.author.id))
                        {
                            if ((field == 'slots') || (field == 'spots'))
                            {
                                let roster = oldEmbed.fields[0].value.split('\u000D');

                                if (isNaN(fieldInput))
                                {
                                    message.channel.send('**Please supply a valid raid ID to edit**')
                                                    .then( msg => msg.delete({ timeout: 10000 }));

                                    message.delete();

                                    return;
                                }

                                if ((fieldInput > 12) || (fieldInput < 1))
                                {
                                    return message.channel.send('**Number of spots on a schedule must be between 1 and 12**')
                                                            .then( msg => msg.delete({ timeout: 10000 }));
                                }

                                if (roster.length > fieldInput)
                                {
                                    roster.splice(fieldInput);
                                }
                                else
                                {
                                    for (var i = roster.length; i < fieldInput; i++)
                                    {
                                        roster.push(`${i+1}) `)
                                    }
                                }

                                roster = roster.join('\u000D');
                                
                                oldEmbed.fields = [];
                                const editedEmbed = new Discord.MessageEmbed(oldEmbed);
                        
                                editedEmbed.addField('Raid Roster', roster);

                                raid.edit(editedEmbed);

                                message.channel.send('**Raid Schedule activity successfully edited**')
                                                .then( msg => msg.delete({ timeout: 10000 }));
                            }
                            else if (field == 'activity')
                            {
                                let description = oldEmbed.description.split(' - ');

                                description[0] = `**${fieldInput}**`;

                                const editedEmbed = new Discord.MessageEmbed(oldEmbed);

                                editedEmbed.setDescription(description.join(' - '));

                                raid.edit(editedEmbed);

                                message.channel.send('**Raid Schedule activity successfully edited**')
                                            .then( msg => msg.delete({ timeout: 10000 }));
                            }
                            else if (field == 'time')
                            {
                                let description = oldEmbed.description.split(' - ');

                                let time = description[1].split('\u000D');

                                time[0] = fieldInput;

                                time = time.join('\u000D');

                                description[1] = time;

                                const editedEmbed = new Discord.MessageEmbed(oldEmbed);

                                editedEmbed.setDescription(description.join(' - '));

                                raid.edit(editedEmbed);

                                message.channel.send('**Raid Schedule time successfully edited**')
                                            .then( msg => msg.delete({ timeout: 10000 }));
                            }
                            else if ((field == 'desc') || (field == 'description'))
                            {
                                let description = oldEmbed.description.split('\u000D');

                                description[1] = fieldInput;

                                const editedEmbed = new Discord.MessageEmbed(oldEmbed);

                                editedEmbed.setDescription(description.join('\u000D'));

                                raid.edit(editedEmbed);

                                message.channel.send('**Raid Schedule description successfully edited**')
                                            .then( msg => msg.delete({ timeout: 10000 }));
                            }
                            else if (field == 'icon')
                            {
                                let icon = 'https://cdn.discordapp.com/attachments/569081839134965771/599893637253431326/darkness5.png';

                                const editedEmbed = new Discord.MessageEmbed(oldEmbed);

                                if (fieldInput == 'chalice')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/605563780868341761/chalice.png';
                                }
                                else if (fieldInput == 'crown')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/605563769921208360/crown.png';
                                }
                                else if (fieldInput == 'lastwish')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/605563789072531464/dreamingcity.png';
                                }
                                else if (fieldInput == 'scourge')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/605566962709430285/scourgeicon.png';
                                }
                                else if (fieldInput == 'vanguard')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/605563775700959232/vanguard.png';
                                }
                                else if (fieldInput == 'raid')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/605563767325196288/scourge.png';
                                }
                                else if (fieldInput == 'crucible')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/605567242641473550/crucibleicon.png';
                                }
                                else if (fieldInput == 'gambit')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/605567780137467904/gambit.png';
                                }
                                else if (fieldInput == 'darkness')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/599893637253431326/darkness5.png';
                                }
                                else if (fieldInput == 'goblin')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/623557007751774228/goblin2.png';
                                }
                                else if (fieldInput == 'garden')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/632729220094754836/garden.png';
                                }
                                else if (fieldInput == 'vex')
                                {
                                    icon = 'https://cdn.discordapp.com/attachments/569081839134965771/632729623758635019/Vex.png';
                                }
                                else
                                {
                                    message.channel.send('**Please supply a valid icon name**')
                                                    .then( msg => msg.delete({ timeout: 10000 }));

                                    message.delete();
                                    
                                    return;
                                }

                                editedEmbed.setThumbnail(icon);

                                raid.edit(editedEmbed);

                                message.channel.send('**Raid Schedule icon successfully edited**')
                                            .then( msg => msg.delete({ timeout: 10000 }));
                            }
                            else if (field == 'iconsp')
                            {
                                let icon = 'https://cdn.discordapp.com/attachments/569081839134965771/599893637253431326/darkness5.png';

                                const editedEmbed = new Discord.MessageEmbed(oldEmbed);

                                icon = fieldInput;

                                editedEmbed.setThumbnail(icon);

                                raid.edit(editedEmbed);

                                message.channel.send('**Raid Schedule icon successfully edited**')
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
                            message.channel.send('**You do not have permission to edit this raid schedule**')
                                            .then( msg => msg.delete({ timeout: 10000 }));
                        }
                    })
                    .catch(error => message.channel.send('**Please supply a valid raid ID to edit**')
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
                    .setAuthor(quoteeGuildMember.displayName, quoteeUser.avatarURL({ format: "png", dynamic: true }))
                    .setColor(color)
                    .setDescription(reply)
                    .setFooter(`in #${message.channel.name}`)
                    .setTimestamp(message.createdTimestamp);
                    
                    message.channel.send(roster, {embed: embed});
                }
                else
                {
                    message.channel.send('**You do not have permission to alert this schedule roster**')
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
                
                if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (inRoster(roster, message.author.id)))
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
                        .setAuthor(quoteeGuildMember.displayName, quoteeUser.avatarURL({ format: "png", dynamic: true }))
                        .setColor(color)
                        .setDescription(reply)
                        .setFooter(`in #${message.channel.name}`)
                        .setTimestamp(message.createdTimestamp);
                        
                        message.channel.send(`**Raid Schedule successfully deleted**\u000D${roster}`, {embed: embed});

                        oldSchedules.send(deletedSchedule);
    
                        schedule.delete();
                    }
                    else
                    {
                        message.channel.send('**Raid Schedule successfully deleted**')
                                    .then( msg => msg.delete({ timeout: 10000 }));

                        oldSchedules.send(deletedSchedule);

                        schedule.delete();
                    }
                }
                else
                {
                    message.channel.send('**You do not have permission to delete this raid schedule**')
                                        .then( msg => msg.delete({ timeout: 10000 }));
                }
            })
            .catch(error => message.channel.send('**Please supply a valid schedule ID to delete**')
                                            .then( msg => msg.delete({ timeout: 10000 }))
        )
    }
    else if (action == 'transfer')////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        var [raidID, ...tempPlayerId] = restArgs;

        if (isNaN(raidID))
        {
            message.channel.send('**Please supply a valid schedule ID to transfer ownership**')
                            .then( msg => msg.delete({ timeout: 10000 }));
                        
            message.delete();

            return;
        }

        findMessage(message, raidID)
            .then(raid => {

            var oldEmbed = raid.embeds[0];

            var roster = oldEmbed.fields[0].value;
            
            var raidIconID = oldEmbed.author.iconURL.split('avatars/')[1].split('/')[0];

            if ((message.member.roles.cache.some(r => r.name === 'bouncer')) || (raidIconID == message.author.id))
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

                    editedEmbed.setAuthor(newHost.displayName, newHost.user.avatarURL({ format: "png", dynamic: true }));
                    editedEmbed.setColor(colour);
            
                    raid.edit(editedEmbed);

                    message.channel.send(`**Successfully transfered schedule ownership to** <@${tempPlayerId}>`)
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
    else
    {
        message.channel.send('**Please supply a valid action**')
        .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    message.delete();
};