const Discord = require('discord.js');
const db = require('quick.db');

exports.run = (client, message, args, tools) =>
{
    if (message.channel.id != '534930722759245825' && message.channel.id != '626559189296349234' && message.channel.id != '579882323995262976')
    {
        message.channel.send('**Please use the `~rank` command in <#534930722759245825>**')
        .then( msg => msg.delete({ timeout: 10000 }));

        message.delete();

        return;
    }

    var members = new db.table('members');

    function shuffle(array)
    {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
    }

    function sort(array)
    {
        var leaderboard = [];
        var name;
        var rank = 1;
        var extraLine = '';

        array.sort((a, b) => (b.field - a.field));

        for (var i = 0; i < array.length; i++)
        {
            if (i > 0)
            {
                if (array[i].field != array[i-1].field)
                {
                    rank = i+1;
                }
            }
            
            if (message.member.id == array[i].member.id)
            {
                name = `[${array[i].member.displayName}]`

                if (i > 10)
                {
                    extraLine = `...\u000D${rank}) **${array[i].member.displayName}** _(Total: ${array[i].field})_`
                }
            }
            else
            {
                name = array[i].member.displayName;
            }

            leaderboard.push(`${rank}) **${name}** _(Total: ${array[i].field})_`);
        }

        if (leaderboard.length > 10)
        {
            leaderboard.length = 10;
        }

        if (extraLine != '')
        {
            leaderboard.push(extraLine);
        }

        leaderboard.push(url);
        leaderboard = leaderboard.join('\u000D');

        return leaderboard;
    }

    var guild = message.channel.guild;
    var locals = shuffle(guild.roles.cache.get('534919438726856735').members.array()); // locals

    var url = `\u000DSee the full leaderboard: [ando.ws](https://www.youtube.com/watch?v=6n3pFFPSlW4)`;

    var [leaderboard, ...restArgs] = args;

    if (leaderboard == 'flakes')
    {
        var flakes = [];

        for (var i = 0; i < locals.length; i++)
        {
            if (members.get(`${locals[i].id}.flakes`) > 0)
            {
                flakes.push({member: locals[i], field: members.get(`${locals[i].id}.flakes`)});
            }
        }

        flakes = sort(flakes);

        const embed = new Discord.MessageEmbed()
            .setAuthor('Top Guardians by D2 Total Activity Flakes')
            .setColor('#e4590e')
            .setDescription(flakes);

            message.channel.send(embed);
    }
    else if (leaderboard == 'totalclears')
    {
        var clears = [];

        for (var i = 0; i < locals.length; i++)
        {
            if (members.get(`${locals[i].id}.clears`) > 0)
            {
                clears.push({member: locals[i], field: members.get(`${locals[i].id}.clears`)});
            }
        }

        clears = sort(clears);

        const embed = new Discord.MessageEmbed()
            .setAuthor('Top Guardians by D2 Total Full Clan Raid Clears')
            .setColor('#e4590e')
            .setDescription(clears);

            message.channel.send(embed);
    }
    else if (leaderboard == 'regulars')
    {
        var roleCount = 0;

        var regularsLB = [];

        var regulars = ['654449509421678632', // regulars
                        '628794671069528064', // s8
                        '534919307784618015', // s7
                        '552534486894772239', // s6
                        '536913425503092736'] // s5

        for (var i = 0; i < locals.length; i++)
        {
            for (var j = 0; j < regulars.length; j++)
            {
                if (locals[i].roles.cache.some(r => r.id == regulars[j])) // s5
                {
                    roleCount++;
                }
            }

            if (roleCount > 0)
            {
                regularsLB.push({member: locals[i], field: roleCount});
            }
            
            roleCount = 0;
        }

        regularsLB = sort(regularsLB);

        const embed = new Discord.MessageEmbed()
            .setAuthor('Top Guardians by Pub Crawl Total Regular Roles')
            .setColor('#e4590e')
            .setDescription(regularsLB);

        message.channel.send(embed);
    }
    else if (leaderboard == 'roles')
    {
        var roleCount = 0;

        var rolesLB = [];

        var roles = [   '558422209362657290', // lens of fate
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
                        '585548115243696170']; // nitro

        for (var i = 0; i < locals.length; i++)
        {
            for (var j = 0; j < roles.length; j++)
            {
                if (locals[i].roles.cache.some(r => r.id == roles[j])) // s5
                {
                    roleCount++;
                }
            }

            if (roleCount > 0)
            {
                rolesLB.push({member: locals[i], field: roleCount});
            }
            
            roleCount = 0;
        }

        rolesLB = sort(rolesLB);

        const embed = new Discord.MessageEmbed()
            .setAuthor('Top Guardians by Pub Crawl Total Trophy Roles')
            .setColor('#e4590e')
            .setDescription(rolesLB);

        message.channel.send(embed);
    }
}