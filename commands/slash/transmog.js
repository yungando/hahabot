const addHexRole = (member, input) => {
  if (member.guild.roles.cache.some((r) => r.name === `#${input} - vanity`)) {
    member.roles.add(member.guild.roles.cache.find((r) => r.name === `#${input} - vanity`).id);
  } else {
    member.guild.roles.create(
      {
        name: `#${input} - vanity`,
        color: `${input}`,
        position: member.guild.roles.cache.find((r) => r.name === 'haha').position,
        permissions: [],
      },
    )
      .then((role) => member.roles.add(role));
  }
};

const addRole = (member, vanityRole) => {
  if (member.roles.highest !== vanityRole) {
    if (member.guild.roles.cache.some((r) => r.name === `${vanityRole.name} - vanity`)) {
      member.roles.add(member.guild.roles.cache.find((r) => r.name === `${vanityRole.name} - vanity`).id);
    } else {
      member.guild.roles.create(
        {
          name: `${vanityRole.name} - vanity`,
          color: `${vanityRole.hexColor}`,
          position: member.guild.roles.cache.find((r) => r.name === 'haha').position,
          permissions: [],
        },
      )
        .then((role) => member.roles.add(role));
    }
  }
};

module.exports = {
  name: 'transmog',
  description: 'Set your name\'s colour in the server.',
  options: [
    {
      type: 3,
      name: 'input',
      description: 'Hex colour code, Role name or "off". Examples: "#1a1a1a", "MW S4" or "off"',
      required: true,
    }],
  async execute(client, interaction) {
    let input = interaction.options.getString('input');

    const { member } = interaction;

    if (input.toLowerCase() === 'off') {
      if (member.roles.highest.name.includes('vanity')) {
        if (member.roles.highest.members.size < 2) {
          member.roles.highest.delete();
        } else {
          member.roles.remove(member.roles.highest);
        }
      }

      interaction.reply({ content: 'Turned transmog off.', ephemeral: true });

      return;
    }

    const memberRoles = member.roles.cache;

    if (input.startsWith('#')) {
      const hexReg = /^[0-9A-F]{6}$/i;

      input = input.slice(1).toUpperCase();

      if (hexReg.test(`${input}`)) {
        for (let i = 0; i < memberRoles.size; i += 1) {
          if (memberRoles.at(i).name.includes('vanity')) {
            memberRoles.delete(memberRoles.at(i));
          }
        }

        if (member.roles.highest.name.includes('vanity')) {
          if (member.roles.highest.members.size < 2) {
            member.roles.highest.delete().then(() => addHexRole(member, input));

            interaction.reply({ content: `Applied vanity colour: \`#${input}\``, ephemeral: true });

            return;
          }

          member.roles.remove(member.roles.highest).then(() => addHexRole(member, input));

          interaction.reply({ content: `Applied vanity colour: \`#${input}\``, ephemeral: true });

          return;
        }

        addHexRole(member, input);

        interaction.reply({ content: `Applied vanity colour: \`#${input}\``, ephemeral: true });

        return;
      }
    }

    let vanityRole;

    for (let i = 0; i < memberRoles.size; i += 1) {
      if (memberRoles.at(i).name.includes('vanity')) {
        memberRoles.delete(memberRoles.at(i));
      }
    }

    for (let i = 0; i < memberRoles.size; i += 1) {
      if (memberRoles.at(i).name.toLowerCase() === input.toLowerCase()) {
        vanityRole = memberRoles.at(i);

        return;
      }
    }

    if (vanityRole === null) {
      interaction.reply({ content: 'Could not find role by that name on your profile.', ephemeral: true });

      return;
    }

    if (vanityRole.hexColor === '#000000') {
      interaction.reply({ content: 'You cannot transmog roles with the default colour,', ephemeral: true });

      return;
    }

    if (member.roles.highest === vanityRole || member.roles.highest.name === `${vanityRole.name} - vanity`) {
      interaction.reply({ content: 'That role is already your highest role so cannot be transmogged.', ephemeral: true });

      return;
    }

    if (member.roles.highest.name.includes('vanity')) {
      if (member.roles.highest.members.size < 2) {
        member.roles.highest.delete().then(() => addRole(member, vanityRole));

        interaction.reply({ content: `Applied vanity role: \`${vanityRole.name}\``, ephemeral: true });
      } else {
        member.roles.remove(member.roles.highest).then(() => addRole(member, vanityRole));

        interaction.reply({ content: `Applied vanity role: \`${vanityRole.name}\``, ephemeral: true });
      }
    } else {
      addRole(member, vanityRole);

      interaction.reply({ content: `Applied vanity role: \`${vanityRole.name}\``, ephemeral: true });
    }
  },
};
