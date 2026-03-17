import { ApplicationCommandType, InteractionContextType, MessageFlags } from 'discord.js';
import { sortCategory } from '../../utils/archives.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'archive',
  description: 'Archive this channel.',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: '0',
  guilds: [
    '534915212760055819',
  ],
  contexts: [InteractionContextType.Guild],
  async execute(client, interaction) {
    try {
      const channelToArchive = interaction.channel;
      if (channelToArchive.partial) await channelToArchive.fetch();

      const gamesCategoryId = '785540936457125888';
      const archivedCategory = await interaction.guild.channels.fetch('917120901584150589');
      const retiredCategory = await interaction.guild.channels.fetch('562373109555134496');

      if (channelToArchive.parent.id === gamesCategoryId) {
        clearTimeout(client.archiveTimers.get(`${channelToArchive.id}`));

        await channelToArchive.setParent(archivedCategory, { lockPermissions: true });

        sortCategory(archivedCategory);

        interaction.reply({ content: `Moved <#${channelToArchive.id}> to \`#${archivedCategory.name}\``, flags: MessageFlags.Ephemeral });
      } else {
        channelToArchive.setParent(retiredCategory, { lockPermissions: true });

        interaction.reply({ content: `Moved <#${channelToArchive.id}> to \`#${retiredCategory.name}\``, flags: MessageFlags.Ephemeral });
      }

      const logPayload = {
        logType: 'command',
        message: `/archive: <#${channelToArchive.id}>`,
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, logPayload);
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: `Failed attempting to archive <#${interaction.channel.id}>`,
        error,
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, errorPayload);
    }
  },
};
