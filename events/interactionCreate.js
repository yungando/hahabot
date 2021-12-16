const sendLog = require("../utils/sendLog.js");

module.exports =
{
    async execute(client, interaction)
    {
        if (interaction.partial) await interaction.fetch();

        if (interaction.isCommand())
        {
            const command = client.commands.get(interaction.commandName);
    
            if (!command) return;

            try
            {
                await command.execute(client, interaction);
            }
            catch (error)
            {
                console.log(error);
                sendLog(client, error.toString(), client.user);
            }
            finally
            {
                sendLog(client, interaction.toString(), interaction.user, interaction.guild);
            }

            return;
        }

        if (interaction.isContextMenu())
        {
            const contextMenu = client.contextMenus.get(interaction.commandName);

            if (!contextMenu) return;

            try
            {
                await contextMenu.execute(client, interaction);
            }
            catch (error)
            {
                console.log(error);
                sendLog(client, error.toString(), client.user);
            }
            finally
            {
                sendLog(client, interaction.commandName, interaction.user, interaction.guild);
            }

            return;
        }

        if (interaction.isButton())
        {
            const buttonID = interaction.customId;

            const button = require(`../buttons/${buttonID}.js`);

            try
            {
                await button.execute(client, interaction);
            }
            catch (error)
            {
                console.log(error);
                sendLog(client, error.toString(), client.user);
            }
            finally
            {
                sendLog(client, interaction.customId, interaction.user, interaction.guild);
            }
        }
    }
};