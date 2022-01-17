const sendLog = require("../utils/sendLog.js");

module.exports = 
{
    async execute(client, oldMember, newMember)
    {
        if (oldMember.partial) await oldMember.fetch();
        if (newMember.partial) await newMember.fetch();

        try
        {
            var guild = oldMember.guild;
        
            if (guild.id != '534915212760055819') return; // pollo
        
            if (oldMember.roles.cache.some(role => role.id == '585548115243696170') && !newMember.roles.cache.some(role => role.id == '585548115243696170'))
            {
                guild.systemChannel.send(`<@${newMember.id}> unboosted the server.`);
            }
        }
        catch (error)
        {
            sendLog(client, error.toString(), client.user);
        }
    }
};