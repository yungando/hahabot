const { ApplicationCommandOptionType, ApplicationCommandType, MessageFlags } = require('discord.js');
const sendLog = require('../../utils/sendLog.js');

module.exports = {
  name: 'bird',
  description: 'would a bot send you this',
  type: ApplicationCommandType.ChatInput,
  options: [{
    name: 'user',
    description: 'who\'s getting birded',
    type: ApplicationCommandOptionType.User,
    required: true,
  }],
  default_member_permissions: '0',
  guilds: [
    '534915212760055819',
    '568227296767639552',
    '358046343803174912',
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
