import { ApplicationCommandOptionType, ApplicationCommandType, InteractionContextType, PermissionFlagsBits } from 'discord.js';
import { SERVERS } from '../../config/constants.js';
import { buildSplashUpdateMessage, createSplashTextLeaderboard, generateSplashUpdateTxt, getSplashCount, setLastSplashMessageId } from '../../handlers/splash-texts.js';
import sendLog from '../../utils/send-log.js';

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
          const { count, splashTxt, lastMessageId } = await generateSplashUpdateTxt(client);
          const splashUpdateMessage = buildSplashUpdateMessage(count, splashTxt, lastMessageId);
          const splashButtonId = `splashseed:${lastMessageId}`;

          const response = await interaction.editReply(splashUpdateMessage);

          const interactionFilter = (i) => (
            i.customId === splashButtonId && i.user.id === interaction.user.id
          );
          const buttonPressInteraction = await response
            .awaitMessageComponent({ filter: interactionFilter, time: 300_000 });

          await setLastSplashMessageId(lastMessageId);

          const messageUpdate = buildSplashUpdateMessage(count, splashTxt, lastMessageId, true);

          return buttonPressInteraction.update(messageUpdate);
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
