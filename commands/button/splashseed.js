import { ApplicationCommandType, MessageFlags, messageLink } from 'discord.js';
import { setLastSplashMessageId } from '../../handlers/splash-texts.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'splashseed',
  type: ApplicationCommandType.Message,
  async execute(client, interaction, buttonData) {
    if (interaction.user.id !== 'yungando') interaction.reply({ content: '( ͡° ͜ʖ ͡°)', flags: MessageFlags.Ephemeral });

    const messageId = buttonData;
    // await setLastSplashMessageId(messageId);

    interaction.reply({ content: `splash seeded to ${messageLink(messageId)}`, flags: MessageFlags.Ephemeral });

    const logPayload = {
      logType: 'command',
      message: `splash seeded to ${messageLink(messageId)}`,
      user: interaction.user,
      guild: interaction.guild,
    };

    sendLog(client, logPayload);
  },
};
