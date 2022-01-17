module.exports =
{
    name: 'bird',
    type: '2',
    default_permission: false,
    permissions:
    [{
        id: '269555580425863168',
        type: 2,
        permission: true
    }],
    async execute(client, interaction)
    {
        const dmUser = interaction.options.getUser('user');

        var bird = `＜￣｀ヽ、　　　　　　　／￣>\n　ゝ、　　＼　／⌒ヽ,ノ 　/´\n　　　ゝ、　\`（ ( ͡° ͜ʖ ͡°) ／\n　　 　　>　 　 　,ノ\n　　　　　∠_,,,/´”\nWould a bot send you that\n?`;

        dmUser.send(bird);

        interaction.reply({ content: '( ͡° ͜ʖ ͡°)', ephemeral: true });
    }
}