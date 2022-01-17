module.exports =
{
    name: 'transmog',
    description: 'Set your name\'s colour in the server.',
    options: [
    {
       type: 3,
       name: 'input',
       description: 'Hex colour code, Role name or "off". Examples: "#1a1a1a", "MW S4" or "off"',
       required: true
    }],
    async execute(client, interaction)
    {
        var input = interaction.options.getString('input');

        var member = interaction.member;

        if (input.toLowerCase() == 'off')
        {
            if (member.roles.highest.name.includes('vanity'))
            {
                if (member.roles.highest.members.size < 2)
                {
                    member.roles.highest.delete();
                }
                else
                {
                    member.roles.remove(member.roles.highest);
                }
            }

            interaction.reply({ content: 'Turned transmog off.', ephemeral: true });

            return;
        }
        
        var memberRoles = member.roles.cache;

        if (input.startsWith('#'))
        {
            var hexReg = /^[0-9A-F]{6}$/i;

            input = input.slice(1).toUpperCase();

            if (hexReg.test(`${input}`))
            {
                for (var i = 0; i < memberRoles.size; i++)
                {
                    if (memberRoles.at(i).name.includes('vanity'))
                    {
                        memberRoles.delete(memberRoles.at(i))
                    }
                }

                if (member.roles.highest.name.includes('vanity'))
                {
                    if (member.roles.highest.members.size < 2)
                    {
                        member.roles.highest.delete().then(r => addHexRole());

                        interaction.reply({ content: `Applied vanity colour: \`#${input}\``, ephemeral: true });
        
                        return;
                    }
                    else
                    {
                        member.roles.remove(member.roles.highest).then(r => addHexRole());

                        interaction.reply({ content: `Applied vanity colour: \`#${input}\``, ephemeral: true });
        
                        return;
                    }
                }
                else
                {
                    addHexRole();

                    interaction.reply({ content: `Applied vanity colour: \`#${input}\``, ephemeral: true });
    
                    return;
                }
            }
        }

        var vanityRole;

        for (var i = 0; i < memberRoles.size; i++)
        {
            if (memberRoles.at(i).name.includes('vanity'))
            {
                memberRoles.delete(memberRoles.at(i))
            }
        }

        for (var i = 0; i < memberRoles.size; i++)
        {
            if (memberRoles.at(i).name.toLowerCase() == input.toLowerCase())
            {
                vanityRole = memberRoles.at(i);

                break;
            }
        }

        if (vanityRole == null)
        {
            interaction.reply({ content: `Could not find role by that name on your profile.`, ephemeral: true });
            
            return;
        }

        if (vanityRole.hexColor == '#000000')
        {
            interaction.reply({ content: `You cannot transmog roles with the default colour,`, ephemeral: true });
            
            return;
        }

        if (member.roles.highest == vanityRole || member.roles.highest.name == `${vanityRole.name} - vanity`)
        {
            interaction.reply({ content: `That role is already your highest role so cannot be transmogged.`, ephemeral: true });

            return;
        }

        if (member.roles.highest.name.includes('vanity'))
        {
            if (member.roles.highest.members.size < 2)
            {
                member.roles.highest.delete().then(r => addRole());

                interaction.reply({ content: `Applied vanity role: \`${vanityRole.name}\``, ephemeral: true });

                return;
            }
            else
            {
                member.roles.remove(member.roles.highest).then(r => addRole());

                interaction.reply({ content: `Applied vanity role: \`${vanityRole.name}\``, ephemeral: true });

                return;
            }
        }
        else
        {
            addRole();

            interaction.reply({ content: `Applied vanity role: \`${vanityRole.name}\``, ephemeral: true });

            return;
        }

        function addRole()
        {
            if (member.roles.highest != vanityRole)
            {        
                if (member.guild.roles.cache.some(r => r.name == `${vanityRole.name} - vanity`))
                {
                    member.roles.add(member.guild.roles.cache.find(r => r.name == `${vanityRole.name} - vanity`).id);
                }
                else
                {
                    member.guild.roles.create(
                        {
                            name: `${vanityRole.name} - vanity`,
                            color: `${vanityRole.hexColor}`,
                            position: member.guild.roles.cache.find(r => r.name == 'haha').position,
                            permissions: []
                        })
                    .then(role => member.roles.add(role));
                }
            }
        }

        function addHexRole()
        {
            if (member.guild.roles.cache.some(r => r.name == `#${input} - vanity`))
            {
                member.roles.add(member.guild.roles.cache.find(r => r.name == `#${input} - vanity`).id);
            }
            else
            {
                member.guild.roles.create(
                    {
                        name: `#${input} - vanity`,
                        color: `${input}`,
                        position: member.guild.roles.cache.find(r => r.name == 'haha').position,
                        permissions: []
                    }
                )
                .then(role => member.roles.add(role));
            }
        }
    }
}