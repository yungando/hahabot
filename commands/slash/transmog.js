const {
  ApplicationCommandOptionType, ApplicationCommandType, MessageFlags, InteractionContextType,
} = require('discord.js');

// async function addRole(member, vanityRole) {
//   if (member.roles.highest !== vanityRole) {
//     if (member.guild.roles.cache.some((r) => r.name === `${vanityRole.name} - vanity`)) {
//       member.roles.add(member.guild.roles.cache.find((r) => r.name === `${vanityRole.name} - vanity`).id);
//     } else {
//       const newRole = await member.guild.roles.create(
//         {
//           name: `${vanityRole.name} - vanity`,
//           color: `${vanityRole.hexColor}`,
//           position: member.guild.roles.cache.find((r) => r.name === 'haha').position,
//           permissions: [],
//         },
//       );

//       member.roles.add(newRole);
//     }
//   }
// }

// async function addHexRole(member, input) {
//   if (member.guild.roles.cache.some((r) => r.name === `#${input} - vanity`)) {
//     member.roles.add(member.guild.roles.cache.find((r) => r.name === `#${input} - vanity`).id);
//   } else {
//     const newRole = await member.guild.roles.create(
//       {
//         name: `#${input} - vanity`,
//         color: `${input}`,
//         position: member.guild.roles.cache.find((r) => r.name === 'haha').position,
//         permissions: [],
//       },
//     );

//     member.roles.add(newRole);
//   }
// }

// async function removeVanityRole(memberRoles) {
//   const memberRoleToRemove = memberRoles.find((role) => role.name.includes('vanity'));

//   if (memberRoleToRemove.members.size < 2) {
//     await memberRoles.delete(memberRoleToRemove);
//   } else {
//     await memberRoles.remove(memberRoleToRemove);
//   }
// }

module.exports = {
  name: 'transmog',
  description: 'Set your name\'s colour in the server.',
  type: ApplicationCommandType.ChatInput,
  options: [{
    name: 'role',
    description: 'Activate transmog (change your name\'s colour in the server) using a colour from an earned role.',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'role',
      description: 'Select the role you want to transmog and copy the colour from.',
      type: ApplicationCommandOptionType.Role,
      required: true,
    }],
  }, {
    name: 'hex',
    description: 'Activate transmog (change your name\'s colour in the server) using a hex colour code.',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'input',
      description: 'Input a hex colour code. Can be with or without the #. Examples: "#1a1a1a", "efefef".',
      type: ApplicationCommandOptionType.String,
      required: true,
    }],
  }, {
    name: 'off',
    description: 'Deactivate transmog and remove any vanity role.',
    type: ApplicationCommandOptionType.Subcommand,
  }],
  contexts: [InteractionContextType.Guild],
  async execute(client, interaction) {
    // const input = interaction.options.getString('input');

    // const { member } = interaction;
    // const memberRoles = member.roles.cache;

    // if (input.toLowerCase() === 'off') {
    //   removeVanityRole(memberRoles);

    //   return interaction.reply({ content: 'Transmog disabled.', flags: MessageFlags.Ephemeral });
    // }

    // if (input.startsWith('#')) {
    //   const hexReg = /^[0-9A-F]{6}$/i;

    //   const hexInput = input.slice(1).toUpperCase();

    //   if (hexReg.test(`${hexInput}`)) {
    //     removeVanityRole(memberRoles);

    //     addHexRole(member, hexInput);

    //     return interaction.reply({ content: `Applied vanity colour: \`#${hexInput}\``, flags: MessageFlags.Ephemeral });
    //   }
    // }

    // const vanityRole = memberRoles.find((role) => role.name.toLowerCase() === input.toLowerCase());

    // if (!vanityRole) return interaction.reply({ content: 'Could not find role by that name on your profile.', flags: MessageFlags.Ephemeral });

    // if (vanityRole.hexColor === '#000000') return interaction.reply({ content: 'You cannot transmog roles with the default colour,', flags: MessageFlags.Ephemeral });

    // if (member.roles.highest === vanityRole || member.roles.highest.name === `${vanityRole.name} - vanity`) {
    //   return interaction.reply({ content: 'That role is already your highest role so cannot be transmogged.', flags: MessageFlags.Ephemeral });
    // }

    // if (member.roles.highest.name.includes('vanity')) {
    //   if (member.roles.highest.members.size < 2) {
    //     await member.roles.highest.delete();

    //     addRole(member);

    //     return interaction.reply({ content: `Applied vanity role: \`${vanityRole.name}\``, flags: MessageFlags.Ephemeral });
    //   }
    //   await member.roles.remove(member.roles.highest);

    //   addRole(member);

    //   return interaction.reply({ content: `Applied vanity role: \`${vanityRole.name}\``, flags: MessageFlags.Ephemeral });
    // }
    // addRole(member);

    // return interaction.reply({ content: `Applied vanity role: \`${vanityRole.name}\``, flags: MessageFlags.Ephemeral });

    return interaction.reply({ content: '( ͡° ͜ʖ ͡°)', flags: MessageFlags.Ephemeral });

    // return interaction.reply({ content: `\`\`\`${JSON.stringify(interaction)}\`\`\``, flags: MessageFlags.Ephemeral });
  },
};
