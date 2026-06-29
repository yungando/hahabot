import { ApplicationCommandType, InteractionContextType, MessageFlags, PermissionFlagsBits, userMention } from 'discord.js';
import { SERVERS } from '../../config/constants.js';
import sendLog from '../../utils/send-log.js';

export default {
  name: 'bird',
  guilds: [
    SERVERS.pollo.id,
    SERVERS.hahabot.id,
    SERVERS.mariachi.id,
  ],
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  type: ApplicationCommandType.User,
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
      message: `/bird: ${userMention(dmUser.id)}`,
      user: interaction.user,
      guild: interaction.guild,
    };

    sendLog(client, logPayload);
  },
};
