import { ApplicationCommandType, EmbedBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { SERVERS } from '../../config/constants.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'getarchives',
  description: 'Output all pending channel archive timeouts.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator,
  guilds: [
    SERVERS.pollo.id,
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
        const { _idleStart: idleStart, _idleTimeout: idleTimeout } = timeout;

        const archivesOn = Math.ceil((idleStart + idleTimeout + nowTimestamp) / 1000);
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

      const logPayload = {
        logType: 'command',
        message: '/getArchives',
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, logPayload);
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: 'Failed attempting to get archive timers',
        error,
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
