import { ApplicationCommandOptionType, ApplicationCommandType, InteractionContextType } from 'discord.js';
import { createSplashTextLeaderboard, generateSplashUpdateTxt, getSplashCount, setLastSplashMessageId } from '../../handlers/splash-texts.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'splash',
  description: '#no-context-allowed',
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: '0',
  guilds: [
    '534915212760055819',
  ],
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
          const { splashTxt, count } = await generateSplashUpdateTxt(client);

          return interaction.editReply(
            {
              content: `${count} minecraft splash texts`,
              ...(splashTxt && { files: [splashTxt] }),
            },
          );
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
