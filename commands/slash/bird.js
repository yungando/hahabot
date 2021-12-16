module.exports =
{
    name: 'bird',
    description: 'would a bot send you this',
    options: [
    {
       type: 6,
       name: 'user',
       description: 'who\'s getting birded',
       required: true
    }],
    execute(client, interaction)
    {
        if (interaction.user.tag === 'ando#0404')
        {
            const dmUser = interaction.options.getUser('user');

            var bird = `＜￣｀ヽ、　　　　　　　／￣>\n　ゝ、　　＼　／⌒ヽ,ノ 　/´\n　　　ゝ、　\`（ ( ͡° ͜ʖ ͡°) ／\n　　 　　>　 　 　,ノ\n　　　　　∠_,,,/´”\nWould a bot send you that\n?`;

            dmUser.send(bird);

            interaction.reply({ content: '( ͡° ͜ʖ ͡°)', ephemeral: true });
        }
    }
}