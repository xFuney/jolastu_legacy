module.exports = {
    categoryName: "Utilities",
    categoryDescription: "Utilities that the bot has (including help and ping).",
    commands: {
        "ping": {
            pretty_name: "ping",
            description: "Ping the bot.",
            command_function: async function(MesgElement, Args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG, commands) {
                MesgElement.reply("Ping received.")
            }
        },
        "help": {
            pretty_name: "help",
            description: "Get help.",
            command_function: async function(MesgElement, Args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG, commands) {
                if (!Args[1]) {
                    // No argument specified, list categories.
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor('7289da')
                        .setAuthor(BOT_CONFIG.bot_name + ' List of Command Categories', BOT_CONFIG.bot_image)
                        .setTimestamp()
                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                
                    for (const catName in commands) {
                        exampleEmbed.addField(commands[catName].categoryName + " (" + catName + ")", commands[catName].categoryDescription, false)
                    }
                    
                    MesgElement.channel.send(exampleEmbed)
                    return;
                }
    
                found = false
                foundNumber = 0
    
                for (const catName in commands) {
                    if (catName== Args[1]) {
                        found = commands[catName].categoryName
                        foundNumber = i
                    }
                }
    
                if (found === false) {
                    MesgElement.channel.send("not found")
                    return;
                }
    
                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('7289da')
                    .setAuthor(BOT_CONFIG.bot_name + ' Commands in Category ' + found, BOT_CONFIG.bot_image)
                    .setTimestamp()
                    .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                
                for (const catName in commands) {
                    //console.log(catName)
                    if (catName == Args[1]) {
                        // This is the category we seek.
                        //console.log("found")
                        var i;
                        for (const commandName in commands[catName].commands) {
                            //console.log(commandName)
                            exampleEmbed.addField(BOT_CONFIG.bot_prefix + commands[catName].commands[commandName].pretty_name, commands[catName].commands[commandName].description, false)
                        }
                    }
                }
    
          
                MesgElement.channel.send(exampleEmbed)
            }
        }

    }
}