const Discord = require('discord.js');
const db = require('quick.db');
const clears = require('../webhooks/clears.json');

exports.run = async (client, message, args, tools) =>
{
    var members = new db.table('members');

    var guild = client.guilds.find(g => g.id == '534915212760055819'); // Pub Crawl

    var [action, ...restArgs] = args;
    var discordID;

    if (action == null)
    {
        discordID = message.author.id;
        action = 'get';
    }
    else if(action == 'random')
    {
        do
        {
            discordID = members.all()[Math.floor(Math.random() * members.all().length)].ID;
            action = 'get';
        }
        while (!guild.members.cache.find(m => m.id == discordID));
    }
    else if (message.mentions.members.first() != undefined || message.mentions.members.length > 0)
    {
        discordID = message.mentions.members.first().id;
        action = 'get';
    }
    else if (!isNaN(action))
    {
        if (guild.members.cache.find(m => m.id == action))
        {
            discordID = action;
            action = 'get';
        }
        else
        {
            for (var i = 0; i < members.all().length; i++)
            {
                if (Object.entries(members.all()[i].data).join(' ').includes(action))
                {
                    discordID = members.all()[i].ID;
                    action = 'get';
                    break;
                }
            }
        }

        if (action != 'get')
        {
            message.channel.send('**No User found with given info**')
                        .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }
    }

    if (action == 'setall')
    {
        if (message.author.tag != 'ando#0404')
        {
            message.channel.send('**You do not have the correct permissions**')
                        .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        var [discordID, bungieID, steamID, ...ignore] = restArgs;

        members.get(`${discordID}`);

        members.set(`${discordID}.discordID`, `${discordID}`);
        members.set(`${discordID}.bungieID`, `${bungieID}`);
        members.set(`${discordID}.steamID`, `${steamID}`);

        message.delete();
    }
    else if (action == 'set')
    {
        if (message.author.tag != 'ando#0404')
        {
            message.channel.send('**You do not have the correct permissions**')
                        .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        var [discordID, field, input, ...ignore] = restArgs;
        field = field.toLowerCase();

        members.get(`${discordID}`);

        if (field == 'bungieid')
        {
            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.bungieID`, `${input}`);
        }
        else if (field == 'steamid')
        {
            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.steamID`, `${input}`);
        }
        else if (field == 'platform')
        {
            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.platform`, `${input}`);
        }
        else if (field == 'twitch')
        {
            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.twitch`, `${input}`);
        }
        else if (field == 'youtube')
        {
            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.youtube`, `${input}`);
        }
        else if (field == 'flakes')
        {
            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.flakes`, `${input}`);
        }
        else
        {
            message.channel.send('**Please supply a valid field**')
            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }
    }
    else if (action == 'get')
    {
        if (message.channel.id != '534930722759245825' && message.channel.id != '626559189296349234' && message.channel.id != '579882323995262976')
        {
            if (message.guild.id == '534915212760055819')
            {
                message.channel.send('**Please use the `~info` command in <#534930722759245825>**')
                .then( msg => msg.delete({ timeout: 10000 }));

                message.delete();

                return;
            }
        }

        var bungieID = members.get(`${discordID}.bungieID`);
        var steamID = members.get(`${discordID}.steamID`);
        var platformID = members.get(`${discordID}.platform`);
        var twitch = members.get(`${discordID}.twitch`);
        var youtube = members.get(`${discordID}.youtube`);
        var flakes = members.get(`${discordID}.flakes`);

        var platforms = ['ignore', 'xb', 'ps', 'pc'];

        var member;
        var description = [`<@${discordID}>`];
        var colour;
        var thumbnail;

        var roles = [];
        var rolesWW = [];
        var rolesTS = [];
        var rolesCount = 0;
        var serverRoles = [ '580101673964273681', // barkeep
                            '561558733734543362', // brown
                            '558422209362657290', // lens of fate
                            '654449509421678632', // regulars
                            '663509082522779671', // fashion crawl '20
                            '643358780553428992', // undying
                            '628794671069528064', // s8
                            '612481505482244097', // mmxix
                            '534919307784618015', // s7
                            '580279000115707914', // iron burden
                            '552534486894772239', // s6
                            '579902430331011072', // fashion crawl '19
                            '536913425503092736', // s5
                            '585548115243696170', // nitro
                            '534919438726856735', // locals
                            '574652778857627654', // drinking buddy
                            '547564202638704650', // MIA
                            '540565941977874434', // roles
                            '599755089908989953', // pint
                            '632721027348299807', // nn
                            '594599121478746132', // bouncer
                            '534925628680437783', // lfg
                            '539645535754256387', // comp
                            '683797344889864258', // agent
                            '535149630628036621']; // bots
        
        if (guild.members.cache.find(m => m.id == discordID))
        {
            member = guild.members.cache.find(m => m.id == discordID);
            thumbnail = member.user.avatarURL({ format: "png", dynamic: true });
            
            description.push(`${member.presence.status}`);

            for (let i = 0; i < serverRoles.length; i++)
            {
                if (member.roles.cache.some(r => r.id == serverRoles[i]))
                {
                    roles.push(serverRoles[i]);
                }
            }

            for (let j = 0; j < roles.length; j++)
            {
                if ((rolesCount + member.roles.cache.some(r => r.id == roles[j]).name.length + 2) > 31)
                {
                    rolesWW.push('\u000D');
                    rolesTS.push('\u000D');
                    rolesCount = 0;
                }

                rolesCount += (member.roles.cache.some(r => r.id == roles[j]).name.length + 2);

                rolesWW.push(`<@&${roles[j]}>`);
                rolesTS.push(`@${member.roles.cache.some(r => r.id == roles[j]).name}`);
            }
        }
        else if (client.users.cache.some(m => m.id == discordID))
        {
            member = client.users.cache.find(m => m.id == discordID);
            thumbnail = member.avatarURL({ format: "png", dynamic: true });
        }
        else
        {
            thumbnail = null;
        }

        if (rolesWW.length > 0)
        {
            if (message.guild.id == '534915212760055819')
            {
                rolesWW = rolesWW.join(` `);
            }
            else
            {
                rolesWW = rolesTS.join(` `);
            }

            colour = member.displayHexColor;

            if (colour == '#000000')
            {
                colour = '#99aab5';
            }
        }
        else
        {
            if (((thumbnail == null) || (thumbnail == undefined)) && bungieID == null && steamID == null)
            {
                message.channel.send('**No information found**')
                                .then( msg => msg.delete({ timeout: 10000 }));

                message.delete();

                return;
            }

            rolesWW = '_No Server Roles_';
            colour = '#99aab5';
        }

        if (bungieID != null)
        {
            if (platformID == null)
            {
                platformID = '3';
            }

            var destinyLinks = [    `[Raid Report](https://raid.report/${platforms[platformID]}/${bungieID})`,
                                    `[Braytech](https://braytech.org/${platformID}/${bungieID})`,
                                    `[D2 Checklist](https://d2checklist.com/${platformID}/${bungieID})`,
                                    `[Clan Report](https://clan.report/${platformID}/${bungieID})`,
                                    `[Bungie Profile](https://www.bungie.net/en/Profile/${platformID}/${bungieID})`];

            var destinyLinks2 = [   `[Destiny Tracker](https://destinytracker.com/destiny-2/profile/steam/${bungieID})`,
                                    `[Activity Heatmap](https://chrisfried.github.io/secret-scrublandeux/guardian/${platformID}/${bungieID})`,
                                    `[Time Wasted](https://wastedondestiny.com/${platformID}_${bungieID})`,
                                    `[Guardian Theatre](https://guardian.theater/guardian/${platformID}/${bungieID})`];

            destinyLinks = destinyLinks.join('\n');
            destinyLinks2 = destinyLinks2.join('\n');
        }
        else
        {
            var destinyLinks = '_No Bungie ID saved_';
            var destinyLinks2 = '\u200B';
        }
        
        var otherLinks = [];

        if (steamID != null)
        {
            otherLinks.push(`[Steam Profile](https://steamcommunity.com/profiles/${steamID})`);
        }

        if (twitch != null)
        {
            otherLinks.push(`[Twitch](${twitch})`);
        }

        if (youtube != null)
        {
            otherLinks.push(`[Youtube](${youtube})`);
        }
        
        const infoEmbed = new Discord.MessageEmbed()
        .setColor(colour)
        .setDescription(description.join(' - '))
        .addField('Server Roles', rolesWW, false)
        .setFooter(`~info ${discordID}`)
        .setThumbnail(thumbnail);

        if (!rolesWW.includes('535149630628036621'))
        {
            infoEmbed.addField('Destiny Links', destinyLinks, true);

            if (destinyLinks2 != '\u200B')
            {
                infoEmbed.addField('\u200B', destinyLinks2, true);
            }
        }

        if (otherLinks.length > 0)
        {
            infoEmbed.addField('Other Links', otherLinks.join('\u000D'), false);
        }

        message.channel.send(infoEmbed);
    }
    else if (action == 'delete')
    {
        var [discordID, field, input, ...ignore] = restArgs;

        members.delete(`${discordID}`);
    }
    else if (action == 'addflakes')
    {
        if (message.author.tag != 'ando#0404')
        {
            message.channel.send('**You do not have the correct permissions**')
                        .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        var [discordID, input, ...ignore] = restArgs;
        var flakes = 0;

        members.get(`${discordID}`);

        if (input == undefined || input.length == null)
        {
            if (members.get(`${discordID}.flakes`) == undefined)
            {
                flakes = 1;
            }
            else
            {
                flakes = parseInt(members.get(`${discordID}.flakes`)) + 1;
            }

            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.flakes`, `${flakes}`);
        }
        else if (!isNaN(input))
        {
            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.flakes`, `${members.get(`${discordID}.flakes`) + input}`);
        }
        else
        {
            message.channel.send('**Please supply a valid number of flakes to add**')
            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }
    }
    else if (action == 'import')
    {
        if (message.author.tag != 'ando#0404')
        {
            message.channel.send('**You do not have the correct permissions**')
                        .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }
        
        console.log(clears.length);
        
        for (var i = 0; i < clears.length; i++)
        {
            console.log(`${clears[i].id} - ${clears[i].clears}`);

            for (var j = 0; j < members.all().length; j++)
            {
                if (Object.entries(members.all()[j].data).join(' ').includes(clears[i].id))
                {
                    discordID = members.all()[j].ID;
                    break;
                }
            }

            members.get(`${discordID}`);

            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.clears`, `${clears[i].clears}`);
        }
    }
    else
    {
        message.channel.send('**Please supply a valid discord user ID or command action**')
                        .then( msg => msg.delete({ timeout: 10000 }));
    }

    message.delete();
}