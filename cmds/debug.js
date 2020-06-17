module.exports = {
    categoryName: "debug",
    categoryDescription: "Commands for development/debugging of the bot.",
    commands: {
        "dev--debug": {
            pretty_name: "dev--debug",
            description: "OWNER ONLY: Debug commands/system setup.",
            command_function: function (message, args, serverQueue, Discord, client, search, ytdl, YTDL_OPTS, queue, BOT_CONFIG, commands, ms) {
                if (message.author.id == BOT_CONFIG.bot_owner_id) {
                    if (args[1] == "shutdown") {
                        //SYS_FN_LOG("[DEV] [DEBUG] System has been called for shutdown by user " + message.author.tag + ".")
                        //SYS_FN_SHUTDOWN("Forced shutdown called by user " + message.author.tag + ".")
                        
                        // TODO: Make a state handler.
                    } else if (args[1] == "reboot") {
                        //SYS_FN_LOG("[DEV] [DEBUG] System has been called for reboot by user " + message.author.tag + ".")
                        //SYS_FN_REBOOT("Forced reboot called by user " + message.author.tag + ".")

                        // TODO: Make a state handler.
                    } else {
                        message.channel.send("**DEBUG STUFF** \n*reload_cmd - reload the command database*\n*shutdown - shutdown bot*\n*reboot - restart bot*\n\nAll commands must be run using ==dev--debug <arguments>.")
                    }
                }
            }
        }
    }
}