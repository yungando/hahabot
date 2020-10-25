const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args, tools) =>
{
    var members = new db.table('members');
    var getall = false;

    var guild = client.guilds.cache.find(g => g.id == '534915212760055819'); // Pub Crawl

    if (args[0] == 'all' || args[0] == 'getall')
    {
        args.shift();

        getall = true;
    }

    var [action, ...restArgs] = args;
    var discordID;

    if (action == null)
    {
        discordID = message.author.id;
        action = 'get';
    }
    else if (message.mentions.members.first() != undefined || message.mentions.members.length > 0)
    {
        discordID = message.mentions.members.first().id;
        action = 'get';
    }
    else if (!isNaN(action))
    {
        if (guild.members.cache.some(m => m.id == action))
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
                    if (!guild.members.cache.some(m => m.id == discordID))
                    {
                        getall = true;
                    }

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

    //////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////

    if (action == 'get')
    {
        if (message.channel.id != '534930722759245825' && message.channel.id != '626559189296349234' && message.channel.id != '579882323995262976' && message.channel.id != '724671647369396325')
        {
            if (message.guild.id == '534915212760055819')
            {
                message.channel.send('**Please use the `~info` command in a Stats channel.**')
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
        var battletag = members.get(`${discordID}.battletag`);
        var activID = members.get(`${discordID}.activID`);

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
                            '769726185198059540', // trailblazer
                            '760887215118614659', // mw s6
                            '737478676735721573', // mw s5
                            '721581377367310336', // d2 s11
                            '720649008531374092', // mw s4
                            '717603946952130561', // damascus
                            '702535488095125606', // tiger woods
                            '698358436580163605', // d2 s10
                            '654449509421678632', // d2 s9
                            '663509082522779671', // fashion crawl '20
                            '643358780553428992', // undying
                            '628794671069528064', // d2 s8
                            '612481505482244097', // mmxix
                            '534919307784618015', // d2 s7
                            '580279000115707914', // iron burden
                            '552534486894772239', // d2 s6
                            '579902430331011072', // fashion crawl '19
                            '536913425503092736', // d2 s5
                            '585548115243696170', // nitro
                            '534919438726856735', // locals
                            '574652778857627654', // drinking buddy
                            '599755089908989953', // pint
                            '540565941977874434', // roles
                            '594599121478746132', // bouncer
                            '698345563485372497', // guardian
                            '534925628680437783', // lfg
                            '539645535754256387', // comp
                            '694647773060136981', // fng
                            '690375204404330506', // demon
                            '724980000557629592', // lumbridge
                            '535149630628036621']; // bots
        
        if (guild.members.cache.some(m => m.id == discordID))
        {
            member = guild.members.cache.find(m => m.id == discordID);
            thumbnail = member.user.displayAvatarURL({ format: "png", dynamic: true });
            
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
                if ((rolesCount + member.roles.cache.find(r => r.id == roles[j]).name.length + 3) > 39)
                {
                    rolesWW.push('\n');
                    rolesTS.push('\n');
                    rolesCount = 0;
                }

                rolesCount += (member.roles.cache.find(r => r.id == roles[j]).name.length + 3);

                rolesWW.push(`<@&${roles[j]}>`);
                rolesTS.push(`@${member.roles.cache.find(r => r.id == roles[j]).name}`);
            }
        }
        else if (client.users.cache.some(m => m.id == discordID))
        {
            member = client.users.cache.find(m => m.id == discordID);
            thumbnail = member.displayAvatarURL({ format: "png", dynamic: true });
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
            if (((thumbnail == null) || (thumbnail == undefined)) && bungieID == null && steamID == null )
            {
                message.channel.send('**No information found**')
                                .then( msg => msg.delete({ timeout: 10000 }));

                message.delete();

                return;
            }

            rolesWW = '_No Server Roles_';
            colour = '#99aab5';
        }

        const infoEmbed = new Discord.MessageEmbed()
        .setColor(colour)
        .setDescription(description.join(' - '))
        .addField('Server Roles', rolesWW, false)
        .setFooter(`~info ${discordID}`)
        .setThumbnail(thumbnail);

        var ids = [ `Discord ID - ${discordID}` ];

        if ((getall || member.roles.cache.some(r => r.name == 'guardian')) && bungieID != null)
        {
            if (platformID == null)
            {
                platformID = '3';
            }

            var destinyLinks = [    `[Braytech](https://braytech.org/${platformID}/${bungieID})`,
                                    `[Raid Report](https://raid.report/${platforms[platformID]}/${bungieID})`,
                                    `[Dungeon Report](https://dungeon.report/${platforms[platformID]}/${bungieID})`,
                                    `[Trials Report](https://trials.report/report/${platformID}/${bungieID})`,
                                    `[Clan Report](https://clan.report/${platformID}/${bungieID})`,
                                    `[Bungie Profile](https://www.bungie.net/en/Profile/${platformID}/${bungieID})`];

            var destinyLinks2 = [   `[Destiny Tracker](https://destinytracker.com/destiny-2/profile/steam/${bungieID})`,
                                    `[D2 Checklist](https://d2checklist.com/${platformID}/${bungieID})`,
                                    `[Activity Heatmap](https://chrisfried.github.io/secret-scrublandeux/guardian/${platformID}/${bungieID})`,
                                    `[Time Wasted](https://wastedondestiny.com/${platformID}_${bungieID})`,
                                    `[Guardian Theatre](https://guardian.theater/guardian/${platformID}/${bungieID})`];

            destinyLinks = destinyLinks.join('\n');
            destinyLinks2 = destinyLinks2.join('\n');

            ids.push(`Bungie ID - ${bungieID}`);

            infoEmbed.addField('Destiny Links', destinyLinks, true);
            infoEmbed.addField('\u200B', destinyLinks2, true);
            infoEmbed.addField('\u200B', '\u200B', true);
        }
        
        var otherLinks = [];

        if (steamID != null) 
        {
            otherLinks.push(`[Steam Profile](https://steamcommunity.com/profiles/${steamID})`)

            ids.push(`Steam ID - ${steamID}`);
        };

        if (twitch != null) otherLinks.push(`[Twitch](${twitch})`);
        if (youtube != null) otherLinks.push(`[Youtube](${youtube})`);

        if ((getall || member.roles.cache.some(r => r.name == 'fng')) && activID != null)
        {
            var codLinks = [    `[CoD Stats](https://codstats.net/warzone/profile/act/${activID.split('#').join('%23')})`,
                                `[CoD Tracker](https://cod.tracker.gg/warzone/profile/atvi/${activID.split('#').join('%23')})`];

            codLinks = codLinks.join('\n');

            ids.push(`ActivID - ${activID}`);

            infoEmbed.addField('Call of Duty Links', codLinks, true);
        }

        if (battletag != null)
        {
            ids.push(`Battletag - ${battletag}`);
        }

        if (otherLinks.length > 0)
        {
            infoEmbed.addField('Other Links', otherLinks.join('\n'), true);
            infoEmbed.addField('\u200B', '\u200B', true);
        }

        if (getall) infoEmbed.addField('IDs', ids.join('\n'), false);

        message.channel.send(infoEmbed);
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
        else if (field == 'battletag')
        {
            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.battletag`, `${input}`);
        }
        else if (field == 'activid')
        {
            members.set(`${discordID}.discordID`, `${discordID}`);
            members.set(`${discordID}.activID`, `${input}`);
        }
        else
        {
            message.channel.send('**Please supply a valid field**')
            .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }
    }
    else if (action == 'setall')
    {
        if (message.author.tag != 'ando#0404')
        {
            message.channel.send('**You do not have the correct permissions**')
                        .then( msg => msg.delete({ timeout: 10000 }));

            message.delete();

            return;
        }

        var [discordID, bungieID, steamID, platform, ...ignore] = restArgs;

        members.get(`${discordID}`);

        members.set(`${discordID}.discordID`, `${discordID}`);
        members.set(`${discordID}.bungieID`, `${bungieID}`);
        members.set(`${discordID}.steamID`, `${steamID}`);

        if (platform != null)
        {
            members.set(`${discordID}.platform`, `${platform}`);
        }
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
    else
    {
        message.channel.send('**Please supply a valid discord user ID or command action**')
                        .then( msg => msg.delete({ timeout: 10000 }));
    }

    message.delete();
}