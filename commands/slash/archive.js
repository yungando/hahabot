import { ApplicationCommandType, channelMention, InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { SERVERS } from '../../config/constants.js';
import { sortCategory } from '../../handlers/archives.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'archive',
  description: 'Archive this channel.',
  guilds: [
    SERVERS.pollo.id,
  ],
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.Guild],
  async execute(client, interaction) {
    try {
      const channelToArchive = interaction.channel;
      if (channelToArchive.partial) await channelToArchive.fetch();

      const archivedCategory = await interaction.guild.channels
        .fetch(SERVERS.pollo.categories.archivedGames.id);
      const retiredCategory = await interaction.guild.channels
        .fetch(SERVERS.pollo.categories.retiredThreads.id);

      if (channelToArchive.parent.id === SERVERS.pollo.categories.games.id) {
        clearTimeout(client.archiveTimers.get(`${channelToArchive.id}`));

        await channelToArchive.setParent(archivedCategory, { lockPermissions: true });

        await sortCategory(archivedCategory);

        interaction.reply({ content: `Moved ${channelMention(channelToArchive.id)} to \`#${archivedCategory.name}\``, flags: MessageFlags.Ephemeral });
      } else {
        await channelToArchive.setParent(retiredCategory, { lockPermissions: true });

        interaction.reply({ content: `Moved ${channelMention(channelToArchive.id)} to \`#${retiredCategory.name}\``, flags: MessageFlags.Ephemeral });
      }

      const logPayload = {
        logType: 'command',
        message: `/archive: ${channelMention(channelToArchive.id)}`,
        user: interaction.user,
        guild: interaction.guild,
      };
      sendLog(client, logPayload);
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: `Failed attempting to archive ${channelMention(interaction.channel.id)}`,
        error,
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
