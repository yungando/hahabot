import { ApplicationCommandType, MessageFlags, InteractionContextType } from 'discord.js';
import sendLog from '../../utils/sendLog.js';

export default {
  name: 'bird',
  type: ApplicationCommandType.User,
  default_member_permissions: '0',
  guilds: [
    '534915212760055819',
    '568227296767639552',
    '358046343803174912',
  ],
  contexts: [
    InteractionContextType.Guild,
    InteractionContextType.PrivateChannel,
  ],
  async execute(client, interaction) {
    const dmUser = interaction.options.getUser('user');

    const bird = '＜￣｀ヽ、　　　　　　　／￣>\n　ゝ、　　＼　／⌒ヽ,ノ 　/´\n　　　ゝ、　`（ ( ͡° ͜ʖ ͡°) ／\n　　 　　>　 　 　,ノ\n　　　　　∠_,,,/´”\nWould a bot send you that\n?';

    dmUser.send(bird);

    interaction.reply({ content: '( ͡° ͜ʖ ͡°)', flags: MessageFlags.Ephemeral });

    const logPayload = {
      logType: 'command',
      message: `/bird: <@${dmUser.id}>`,
      user: interaction.user,
      guild: interaction.guild,
    };

    sendLog(client, logPayload);
  },
};
