const api_db = require("../api/database.js")

module.exports = {
    categoryName: "Moderation",
    categoryDescription: "Moderate using the bot.",
    functions: {
        getUserFromMention: function(mention, client) {
            if (!mention) return;

            if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
            }
        }
    },
    commands: {
        "kick": {
            pretty_name: "kick",
            description: "Kick a user with a specified reason. Must have KICK_MEMBERS to do this.",
            command_function: async function(message, args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG, commands) {
               if (message.member.hasPermission('KICK_MEMBERS')) {
                   // User hsa permission to kick members.
                   ////console.log(args[1].substring(0,3))
                   if (message.mentions.members.first()) {
                        // First Argument is a mention. We can continue.
                        let warned = module.exports.functions.getUserFromMention(args[1], client);
                        var link = ""
                        var i;
                        var query = ""
    
                        for (i = 2; i < args.length; i++) {
                                query = query + args[i] + " "
                        }
                        api_db.add(message.guild.id, "user_kicks", {user_id: warned.id, moderator_id: message.author.id, reason: query});
                   
                        message.channel.send("Kicked.")
                        var warnEmbed = new Discord.MessageEmbed()
                            .setColor('ff0000')
                            .setTitle("Notice of manual punishment")
                            .setAuthor('You were kicked from ' + message.guild.name + ' by ' + message.author.tag + '.', BOT_CONFIG.bot_image)
                            .setDescription("Reason for kick: **"+ query +"** \n\nYou may rejoin the server at any time. Another infraction may result in a ban.")
                            .setTimestamp()
                            .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                    
                        warned.send(warnEmbed);

                       if (BOT_CONFIG.infraction_logging_enabled) {

                           let channel = client.channels.cache.get(BOT_CONFIG.infraction_log_channel)

                           let logEmbed = new Discord.MessageEmbed()
                               .setColor('ff0000')
                               .setTitle('Punishment log')
                               .setAuthor(warned.tag + ' (' + warned.id + ') was kicked by ' + message.author.tag)
                               .setDescription("Reason for kick: **"+ query +"**")
                               .setTimestamp()
                               .setFooter('Brought to you by ' + BOT_CONFIG.bot_name)

                           channel.send(logEmbed)

                       }

                        message.mentions.members.first().kick();
                   } else {
                        message.channel.send("You must provide a mention in order to kick a user.");
                   }
               } else {
                    //console.log("No perms.")
               }
            }
        },
        "ban": {
            pretty_name: "ban",
            description: "Ban a user with a specified reason. Must have BAN_MEMBERS to do this.",
            command_function: async function(message, args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG, commands) {
               if (message.member.hasPermission('BAN_MEMBERS')) {
                   // User hsa permission to kick members.
                   ////console.log(args[1].substring(0,3))
                   if (message.mentions.members.first()) {
                        // First Argument is a mention. We can continue.
                        let warned = module.exports.functions.getUserFromMention(args[1], client);
                        var link = ""
                        var i;
                        var query = ""
    
                        for (i = 2; i < args.length; i++) {
                                query = query + args[i] + " "
                        }
                        api_db.add(message.guild.id, "user_bans", {user_id: warned.id, moderator_id: message.author.id, reason: query.replace(/'/g, "\''")});
                   
                        message.channel.send("Banned successfully.")

                        var warnEmbed = new Discord.MessageEmbed()
                            .setColor('ff0000')
                            .setTitle("Notice of manual punishment")
                            .setAuthor('You were banned from ' + message.guild.name + ' by ' + message.author.tag + '.', BOT_CONFIG.bot_image)
                            .setDescription("Reason for ban: **"+ query +"** \n\nYou are not allowed to rejoin, and are advised to submit an appeal if you feel you did nothing wrong.")
                            .setTimestamp()
                            .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                    
                        warned.send(warnEmbed);

                       if (BOT_CONFIG.infraction_logging_enabled) {

                           let channel = client.channels.cache.get(BOT_CONFIG.infraction_log_channel)

                           let logEmbed = new Discord.MessageEmbed()
                               .setColor('ff0000')
                               .setTitle('Punishment log')
                               .setAuthor(warned.tag + ' (' + warned.id + ') was banned by ' + message.author.tag)
                               .setDescription("Reason for ban: **"+ query +"**")
                               .setTimestamp()
                               .setFooter('Brought to you by ' + BOT_CONFIG.bot_name)

                           channel.send(logEmbed)

                       }
                        
                        message.mentions.members.first().ban({reason: "Banned using Jolastu by " + message.author.tag + " with reason: " + query});
                   } else {
                        message.channel.send("You must provide a mention in order to ban a user.");
                   }
               } else {
                    //console.log("No perms.")
               } 
            }
        },
        "warn": {
            pretty_name: "warn",
            description: "Warn a user with a specified reason. Must have MANAGE_MESAGES to do this.",
            command_function: async function(message, args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG, commands) {
               if (message.member.hasPermission('MANAGE_MESSAGES')) {
                   // User hsa permission to kick members.
                   ////console.log(args[1].substring(0,3))
                   if (message.mentions.members.first()) {
                        // First Argument is a mention. We can continue.
                        let warned = module.exports.functions.getUserFromMention(args[1], client);
                        var link = ""
                        var i;
                        var query = ""
    
                        for (i = 2; i < args.length; i++) {
                                query = query + args[i] + " "
                        }
                        api_db.add(message.guild.id, "user_warns", {user_id: warned.id, moderator_id: message.author.id, reason: query});
                   
                        message.channel.send("Warned successfully.")
                        var warnEmbed = new Discord.MessageEmbed()
                            .setColor('ff0000')
                            .setTitle("Notice of manual punishment")
                            .setAuthor('You were warned in ' + message.guild.name + ' by ' + message.author.tag + '.', BOT_CONFIG.bot_image)
                            .setDescription("Reason for warn: **"+ query +"** \n\nBe careful, as ammassing a large amount of warns may result in being kicked or banned from the server.")
                            .setTimestamp()
                            .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                    
                        warned.send(warnEmbed);

                        if (BOT_CONFIG.infraction_logging_enabled) {

                            let channel = client.channels.cache.get(BOT_CONFIG.infraction_log_channel)

                            let logEmbed = new Discord.MessageEmbed()
                                .setColor('ff0000')
                                .setTitle('Punishment log')
                                .setAuthor(warned.tag + ' (' + warned.id + ') was warned by ' + message.author.tag)
                                .setDescription("Reason for warn: **"+ query +"**")
                                .setTimestamp()
                                .setFooter('Brought to you by ' + BOT_CONFIG.bot_name)

                            channel.send(logEmbed)

                        }
                   } else {
                        message.channel.send("You must provide a mention in order to warn a user.");
                   }
               } else {
                    //console.log("No perms.")
               } 
            }
        },
        "get-warns": {
            pretty_name: "get-warns",
            description: "Get the warns of a user. Must have MANAGE_MESSAGES to do this.",
            command_function: async function(message, args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG, commands) {
               if (message.member.hasPermission('MANAGE_MESSAGES')) {
                   // User hsa permission to kick members.
                   ////console.log(args[1].substring(0,3))
                   if (message.mentions.members.first()) {
                        // First Argument is a mention. We can continue.
                        let warned = module.exports.functions.getUserFromMention(args[1], client).id;
                        //let warnList = api_db.get(message.guild.id, "user_warns", {user_id: warned})
                        var output = "";
                        var i;
                        
                        api_db.get(message.guild.id, "user_warns", {user_id: warned})
                                .then( async (warnList) => {                      
                                    for (i=0;i<warnList.length;i++) {
                                      
                                        //let moderatorTag = client.users.cache.get(warnList[i].moderatorID);
                                        ////console.log(moderatorTag)
                                        output = output + "**Warned by " + warnList[i].moderatorID + "** - " + warnList[i].reason + " \n";
                                        ////console.log(output)
                                    }
                                    
                                    //console.log(output)
                                    var okEmbed = new Discord.MessageEmbed()
                                        .setColor('00ff00')
                                        .setTitle('Warns for user ' + message.mentions.users.first().tag + ":")
                                        .setDescription(output)
                                        .setAuthor('Got warns.', BOT_CONFIG.bot_image)
                                        .setTimestamp()
                                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name + ". IDs will be replaced with tags ASAP.");
                                        
                                    message.channel.send(okEmbed)
                                });

                        
                        
                   } else {
                        message.channel.send("You must provide a mention in order to list a user's warns.");
                   }
               } else {
                    //console.log("No perms.")
               } 
            }               
        },
        "get-bans": {
            pretty_name: "get-bans",
            description: "Get the bans of a user. Must have BAN_MEMBERS to do this.",
            command_function: async function(message, args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG, commands) {
               if (message.member.hasPermission('BAN_MEMBERS')) {
                   // User hsa permission to kick members.
                   ////console.log(args[1].substring(0,3))
                   if (message.mentions.members.first()) {
                        // First Argument is a mention. We can continue.
                        let warned = module.exports.functions.getUserFromMention(args[1], client).id;
                        //let warnList = api_db.get(message.guild.id, "user_warns", {user_id: warned})
                        var output = "";
                        var i;
                        
                        api_db.get(message.guild.id, "user_bans", {user_id: warned})
                                .then( async (warnList) => {                      
                                    for (i=0;i<warnList.length;i++) {
                                      
                                        //let moderatorTag = client.users.cache.get(warnList[i].moderatorID);
                                        ////console.log(moderatorTag)
                                        output = output + "**Banned by " + warnList[i].moderatorID + "** - " + warnList[i].reason + " \n";
                                        ////console.log(output)
                                    }
                                    
                                    //console.log(output)
                                    var okEmbed = new Discord.MessageEmbed()
                                        .setColor('00ff00')
                                        .setTitle('Bans for user ' + message.mentions.users.first().tag + ":")
                                        .setDescription(output)
                                        .setAuthor('Got bans.', BOT_CONFIG.bot_image)
                                        .setTimestamp()
                                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name + ". IDs will be replaced with tags ASAP.");
                                        
                                    message.channel.send(okEmbed)
                                });

                        
                        
                   } else {
                        message.channel.send("You must provide a mention in order to list a user's bans.");
                   }
               } else {
                    //console.log("No perms.")
               } 
            }               
        },
        "get-kicks": {
            pretty_name: "get-kicks",
            description: "Get the kicks of a user. Must have KICK_MEMBERS to do this.",
            command_function: async function(message, args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG, commands) {
               if (message.member.hasPermission('KICK_MEMBERS')) {
                   // User hsa permission to kick members.
                   ////console.log(args[1].substring(0,3))
                   if (message.mentions.members.first()) {
                        // First Argument is a mention. We can continue.
                        let warned = module.exports.functions.getUserFromMention(args[1], client).id;
                        //let warnList = api_db.get(message.guild.id, "user_warns", {user_id: warned})
                        var output = "";
                        var i;
                        
                        api_db.get(message.guild.id, "user_kicks", {user_id: warned})
                                .then( async (warnList) => {                      
                                    for (i=0;i<warnList.length;i++) {
                                      
                                        //let moderatorTag = client.users.cache.get(warnList[i].moderatorID);
                                        ////console.log(moderatorTag)
                                        output = output + "**Kicked by " + warnList[i].moderatorID + "** - " + warnList[i].reason + " \n";
                                        ////console.log(output)
                                    }
                                    
                                    //console.log(output)
                                    var okEmbed = new Discord.MessageEmbed()
                                        .setColor('00ff00')
                                        .setTitle('Kicks for user ' + message.mentions.users.first().tag + ":")
                                        .setDescription(output)
                                        .setAuthor('Got kicks.', BOT_CONFIG.bot_image)
                                        .setTimestamp()
                                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name + ". IDs will be replaced with tags ASAP.");
                                        
                                    message.channel.send(okEmbed)
                                });

                        
                        
                   } else {
                        message.channel.send("You must provide a mention in order to list a user's kicks.");
                   }
               } else {
                    //console.log("No perms.")
               } 
            }               
        }
    }
}

