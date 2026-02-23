import { ApplicationCommandOptionType, ApplicationCommandType, InteractionContextType, MessageFlags } from 'discord.js';
import sendLog from '../../utils/sendLog.js';

const createNewRole = async (name, colour, guild) => {
  const hahaRole = await guild.members.me.roles.botRole;
  const newRole = await guild.roles.create(
    {
      name: `${name} - vanity`,
      colors: { primaryColor: `${colour}` },
      position: hahaRole.position,
      permissions: [],
    },
  );

  return newRole;
};

const getVanityRole = async (member, vanityRoleName, vanityRoleColour = vanityRoleName) => {
  const matchingRole = await member.guild.roles.cache.find((role) => role.name === `${vanityRoleName} - vanity`);
  if (matchingRole) return matchingRole;

  const newRole = await createNewRole(vanityRoleName, vanityRoleColour, member.guild);

  return newRole;
};

const handleRemoveRole = async (member) => {
  const memberRoleToRemove = await member.roles.cache.find((role) => role.name.includes('vanity'));

  if (!memberRoleToRemove) return;

  await member.guild.members.fetch();

  if (memberRoleToRemove.members.size < 2) {
    await member.guild.roles.delete(memberRoleToRemove);
  } else {
    await member.roles.remove(memberRoleToRemove);
  }
};

export default {
  name: 'transmog',
  description: 'Set your name\'s colour in the server.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'role',
      description: 'Activate transmog (change your name\'s colour in the server) using a colour from an earned role.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'role',
          description: 'Select the role you want to transmog and copy the colour from.',
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
    {
      name: 'hex',
      description: 'Activate transmog (change your name\'s colour in the server) using a hex colour code.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'input',
          description: 'Input a hex colour code. Can be with or without the #. Examples: "#1a1a1a", "efefef".',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'off',
      description: 'Deactivate transmog and remove any vanity role.',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  contexts: [InteractionContextType.Guild],
  async execute(client, interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const { member } = interaction;
      const subcommand = await interaction.options.getSubcommand();

      const logPayload = {
        logType: 'command',
        message: interaction.toString(),
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, logPayload);

      switch (subcommand) {
        case 'off': {
          await handleRemoveRole(member);

          return interaction.editReply({ content: 'Transmog disabled.', flags: MessageFlags.Ephemeral });
        }
        case 'hex': {
          const input = await interaction.options.getString('input').toUpperCase();
          const hexInput = input.startsWith('#') ? input.slice(1) : input;
          const hexRegex = /^[0-9A-F]{6}$/i;

          if (!hexRegex.test(hexInput)) return interaction.editReply({ content: 'Invalid hex colour code.', flags: MessageFlags.Ephemeral });

          await handleRemoveRole(member);
          const vanityRole = await getVanityRole(member, `#${hexInput}`);

          await member.roles.add(vanityRole);

          return interaction.editReply({ content: `Applied vanity role: <@&${vanityRole.id}>`, flags: MessageFlags.Ephemeral });
        }
        case 'role': {
          const selectedRole = await interaction.options.getRole('role');

          if (!member.roles.cache.some((role) => role.name === selectedRole.name)) {
            return interaction.editReply({ content: 'You can only transmog roles you you have acquired. Please select a different role.', flags: MessageFlags.Ephemeral });
          }

          if (selectedRole.hexColor === '#000000') {
            return interaction.editReply({ content: 'You cannot transmog roles with the default colour. Please select a different role.', flags: MessageFlags.Ephemeral });
          }

          if (member.roles.highest === selectedRole || member.roles.highest.name === `${selectedRole.name} - vanity`) {
            return interaction.editReply({ content: 'You cannot transmog your existing highest role. Please select a different role.', flags: MessageFlags.Ephemeral });
          }

          await handleRemoveRole(member);
          const vanityRole = await getVanityRole(member, selectedRole.name, selectedRole.hexColor);

          await member.roles.add(vanityRole);

          return interaction.editReply({ content: `Applied vanity role: <@&${vanityRole.id}>`, flags: MessageFlags.Ephemeral });
        }
        default: {
          return interaction.editReply({ content: '( ͡° ͜ʖ ͡°)', flags: MessageFlags.Ephemeral });
        }
      }
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: 'Failed attempting to run transmog',
        error,
        user: interaction.user,
        guild: interaction.guild,
      };

      return sendLog(client, errorPayload);
    }
  },
};
