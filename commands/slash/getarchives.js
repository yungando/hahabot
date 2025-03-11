const {
  ApplicationCommandType, MessageFlags, InteractionContextType, EmbedBuilder,
} = require('discord.js');

module.exports = {
  name: 'getarchives',
  description: 'Output all pending channel archive timeouts.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: '0',
  guilds: [
    '534915212760055819',
  ],
  contexts: [InteractionContextType.Guild],
  async execute(client, interaction) {
    try {
      const hahabot = client.user;

      const { archiveTimers } = client;
      const timerArray = [];

      for (const [key, value] of archiveTimers) {
        timerArray.push({ channelId: key, timeout: value });
      }

      const sortTimerArray = timerArray.sort(async (a, b) => {
        const { name: channelNameA } = await interaction.guild.channels.cache.get(a.channelId);
        const { name: channelNameB } = await interaction.guild.channels.cache.get(b.channelId);

        return channelNameA.localeCompare(channelNameB);
      });

      const channelIdArray = [];
      const timeLeftArray = [];

      for (const { channelId, timeout } of sortTimerArray) {
        // eslint-disable-next-line max-len
        const archivesOn = Math.ceil((timeout._idleStart + timeout._idleTimeout + Date.now()) / 1000);
        timeLeftArray.push(`<t:${archivesOn}:R>`);
        channelIdArray.push(`<#${channelId}>`);
      }

      const archivesEmbed = new EmbedBuilder()
        .setAuthor({ name: hahabot.username, iconURL: hahabot.displayAvatarURL({ extension: 'png' }) })
        .setColor('#e71664')
        .addFields(
          { name: 'Channel', value: channelIdArray.join('\n'), inline: true },
          { name: 'Archives On', value: timeLeftArray.join('\n'), inline: true },
        )
        .setFooter({ text: '/getarchives' });

      interaction.reply({ embeds: [archivesEmbed], flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.log(error);
    }
  },
};
