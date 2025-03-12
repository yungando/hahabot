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

      const nowTimestamp = Date.now();

      const { archiveTimers } = client;
      const timerArray = [];

      for (const [channelId, timeout] of archiveTimers) {
        const { name: channelName } = await interaction.guild.channels.fetch(channelId);
        timerArray.push({ channelName, channelId, timeout });
      }

      const sortedTimerArray = timerArray.toSorted((a, b) => {
        const compared = a.channelName.localeCompare(b.channelName);

        return compared;
      });

      const channelIdArray = [];
      const timeLeftArray = [];

      for (const { channelId, timeout } of sortedTimerArray) {
        // eslint-disable-next-line max-len
        const archivesOn = Math.ceil((timeout._idleStart + timeout._idleTimeout + nowTimestamp) / 1000);
        channelIdArray.push(`<#${channelId}>`);
        timeLeftArray.push(`<t:${archivesOn}:R>`);
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
