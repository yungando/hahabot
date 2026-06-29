import { ApplicationCommandOptionType, ApplicationCommandType, InteractionContextType, PermissionFlagsBits } from 'discord.js';
import { SERVERS } from '../../config/constants.js';
import { buildSplashSeedButtonRow, createSplashTextLeaderboard, generateSplashUpdateTxt, getSplashCount, setLastSplashMessageId } from '../../handlers/splash-texts.js';
import sendLog from '../../utils/send-log.js';

const FIVE_MINS_IN_MS = 300000;

export default {
  name: 'splash',
  description: '#no-context-allowed',
  guilds: [
    SERVERS.pollo.id,
  ],
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.Guild],
  options: [
    {
      name: 'update',
      description: 'Generate a .txt of splash texts submitted since the last update.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'seed',
      description: 'Set the last splash message Id to update from.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'messageid',
          description: 'The messageId to seed update from.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'leaderboard',
      description: 'Who has submitted the most splash texts?',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'count',
      description: 'How many do we have?',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  async execute(client, interaction) {
    try {
      await interaction.deferReply();

      const subcommand = await interaction.options.getSubcommand();

      const logPayload = {
        logType: 'command',
        message: interaction.toString(),
        user: interaction.user,
        guild: interaction.guild,
      };

      sendLog(client, logPayload);

      switch (subcommand) {
        case 'update': {
          const { splashTxt, count, lastMessageId } = await generateSplashUpdateTxt(client);
          const actionRow = buildSplashSeedButtonRow(lastMessageId);

          const res = await interaction.editReply(
            {
              content: `${count} minecraft splash texts`,
              ...(splashTxt && { files: [splashTxt] }),
              ...(actionRow && { components: [actionRow], withResponse: true }),
            },
          );

          const confirmation = await res.resource.message
            .awaitMessageComponent({ time: FIVE_MINS_IN_MS });

          if (confirmation.customId === `splashseed:${lastMessageId}`) {
            const updateActionRow = buildSplashSeedButtonRow(lastMessageId, true);

            return interaction.editReply(
              {
                content: `${count} minecraft splash texts`,
                ...(splashTxt && { files: [splashTxt] }),
                ...(updateActionRow && { components: [updateActionRow], withResponse: true }),
              },
            );
          }

          return interaction.editReply({ content: '( ͡° ͜ʖ ͡°)' });
        }
        case 'seed': {
          const messageId = await interaction.options.getString('messageid');

          await setLastSplashMessageId(messageId);

          return interaction.editReply({ content: `Set last splash message Id to \`${messageId}\`.` });
        }
        case 'leaderboard': {
          const leaderboardEmbed = await createSplashTextLeaderboard(client, interaction.guild);

          return interaction.editReply({ embeds: [leaderboardEmbed] });
        }
        case 'count': {
          const splashCount = await getSplashCount(client);

          return interaction.editReply({ content: `${splashCount} minecraft splash texts` });
        }
        default: {
          return interaction.editReply({ content: '( ͡° ͜ʖ ͡°)' });
        }
      }
    } catch (error) {
      const errorPayload = {
        logType: 'error',
        details: 'Failed attempting to run splash command',
        error,
        user: interaction.user,
        guild: interaction.guild,
      };

      return sendLog(client, errorPayload);
    }
  },
};
