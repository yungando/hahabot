const { add } = require("quick.db");

exports.run = async (client, message, args, tools) =>
{
    var guild = message.guild;

    if (guild.id !== '534915212760055819')
    {
        message.delete();

        return;
    }

    var input = args.join(' ').toLowerCase();

    var member = message.member;
    var memberRoles = member.roles.cache;
    var vanityRole;

    if (input == 'off')
    {
        if (member.roles.highest.name.includes('vanity'))
        {
            if (member.roles.highest.members.array().length < 2)
            {
                member.roles.highest.delete();
            }
            else
            {
                member.roles.remove(member.roles.highest);
            }
        }

        message.delete();

        return;
    }

    for (var i = 0; i < memberRoles.array().length; i++)
    {
        if (memberRoles.array()[i].name.includes('vanity'))
        {
            memberRoles.delete(memberRoles.array()[i])
        }
    }

    for (var i = 0; i < memberRoles.array().length; i++)
    {
        if (memberRoles.array()[i].name.toLowerCase().includes(input))
        {
            vanityRole = memberRoles.array()[i];

            break;
        }
    }

    if (vanityRole == null)
    {
        message.channel.send('**Could not find role by that name on your profile**')
                        .then( msg => msg.delete({ timeout: 10000 }));
        
        message.delete();

        return;
    }

    if (vanityRole.hexColor == '#000000')
    {
        message.channel.send('**You cannot transmog roles with the default colour**')
                        .then( msg => msg.delete({ timeout: 10000 }));
        
        message.delete();

        return;
    }

    if (member.roles.highest == vanityRole || member.roles.highest.name == `${vanityRole.name} - vanity`)
    {
        message.channel.send('**That role is already your highest role so cannot be transmogged**')
                        .then( msg => msg.delete({ timeout: 10000 }));
        
        message.delete();

        return;
    }

    if (member.roles.highest.name.includes('vanity'))
    {
        if (member.roles.highest.members.array().length < 2)
        {
            member.roles.highest.delete().then(r => addRole());
        }
        else
        {
            member.roles.remove(member.roles.highest).then(r => addRole());
        }
    }
    else
    {
        addRole();
    }

    function addRole()
    {
        if (member.roles.highest != vanityRole)
        {        
            if (guild.roles.cache.some(r => r.name == `${vanityRole.name} - vanity`))
            {
                member.roles.add(guild.roles.cache.find(r => r.name == `${vanityRole.name} - vanity`).id);
            }
            else
            {
                guild.roles.create({
                    data: {
                        name: `${vanityRole.name} - vanity`,
                        color: `${vanityRole.hexColor}`,
                        position: guild.roles.cache.find(r => r.name == 'haha').position
                    }
                })
                        .then(role => member.roles.add(role));
            }
        }
    }

    message.delete();
}