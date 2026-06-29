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

export { getVanityRole, handleRemoveRole };
