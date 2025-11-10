const { WebhookClient, EmbedBuilder } = require('discord.js');

const { WEBHOOK_LOG_ID, WEBHOOK_LOG_TOKEN } = process.env;
const hahaLOG = new WebhookClient({ id: WEBHOOK_LOG_ID, token: WEBHOOK_LOG_TOKEN });

const getUsername = async (user, guild) => {
  if (!user || user === user.client.user) return 'hahabot';

  if (guild) {
    const member = await guild.members.fetch(user.id);

    if (member?.nickname) {
      const displayName = member.nickname;
      const username = `${displayName} - ${user.username} - ${user.id}`;
      const displayLength = username.length - 80;

      if (displayLength > 0) {
        return `${displayName.toString().slice(0, (displayName.length - displayLength - 1))}… - ${user.username} - ${user.id}`;
      }

      return username;
    }
  }

  return `${user.globalName} - ${user.id}`;
};

const getGuildMemberColour = async (user, guild) => {
  const blankRoleColour = '#2f3136';
  const hahaPink = '#e71664';
  const member = await guild?.members.fetch(user.id);

  if (member?.displayHexColor) return member.displayHexColor;

  if (user === user?.client.user) return hahaPink;

  return blankRoleColour;
};

const buildEmbedAuthor = async (client, user, guild) => {
  const name = await getUsername(user, guild);
  const iconURL = user
    ? await user.displayAvatarURL({ extension: 'png' })
    : await client.user.displayAvatarURL({ extension: 'png' });

  return { name, iconURL };
};

const sendLog = async (client, { content, embeds }) => {
  hahaLOG.send({
    username: 'hahabot',
    avatarURL: await client.user.displayAvatarURL({ extension: 'png' }),
    content,
    embeds,
  });
};

module.exports = async (client, payload) => {
  try {
    switch (payload.logType) {
      case 'string': {
        sendLog(client, { content: payload.message.slice(0, 2000) });

        return;
      }

      case 'command': {
        sendLog(client, {
          embeds: [
            new EmbedBuilder()
              .setAuthor(await buildEmbedAuthor(client, payload.user, payload.guild))
              .setColor(await getGuildMemberColour(payload.user, payload.guild))
              .setDescription(payload.message)
              .setFooter({ text: payload.guild.name })
              .setTimestamp(new Date()),
          ],
        });

        return;
      }

      case 'error': {
        const errorEmbed = new EmbedBuilder()
          .setAuthor(await buildEmbedAuthor(client, payload.user, payload.guild))
          .setColor('Red')
          .setFooter({ text: 'Error' })
          .setTimestamp(new Date());

        if (payload.details) errorEmbed.addFields({ name: 'Details', value: payload.details });
        if (payload.message) errorEmbed.addFields({ name: 'Message', value: payload.message.url });

        errorEmbed.addFields({ name: 'Error', value: `\`\`\`${payload.error.stack}\`\`\`` });

        sendLog(client, { embeds: [errorEmbed] });

        return;
      }

      default: {
        sendLog(client, { content: `Invalid sendLog payload: typeof ${payload.logType}` });
        const errorEmbed = new EmbedBuilder()
          .setAuthor(await buildEmbedAuthor(client))
          .setColor('Red')
          .addFields({ name: 'Details', value: `Invalid sendLog payload: typeof ${payload.logType}` })
          .setFooter({ text: 'Error' })
          .setTimestamp(new Date());

        if (payload.message) errorEmbed.addFields({ name: 'Message', value: payload.message.url });

        errorEmbed.addFields({ name: 'Payload', value: `\`\`\`${payload}\`\`\`` });

        sendLog(client, { embeds: [errorEmbed] });
      }
    }
  } catch (error) {
    sendLog(client, {
      embeds: [
        new EmbedBuilder()
          .setAuthor(await buildEmbedAuthor(client))
          .setColor('Red')
          .addFields({ name: 'Error', value: `\`\`\`${error.stack}\`\`\`` })
          .setFooter({
            text: payload.guild
              ? payload.guild?.name
              : 'hahabot',
          })
          .setTimestamp(new Date()),
      ],
    });
  }
};
