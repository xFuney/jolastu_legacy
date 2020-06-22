//(msg, Arguments, queue.get(msg.guild.id), Discord, client, search, ytdl, YTDL_OPTS, queue, BOT_CONFIG, commands)

module.exports = {
    categoryName: "Giveaways",
    categoryDescription: "Use the bot to do giveaways!",
    functions: {
        random: function(min, max) {  
            return Math.floor(
              Math.random() * (max - min) + min
            )
        }
    },
    commands: {
        "gw-randomping": {
            pretty_name: "gw-randomping",
            description: "Get a random ping from a list of roles, given an ID.",
            command_function: async function (message, args, serverQueue, Discord, client, search, ytdl, YTDL_OPTS, queue, BOT_CONFIG, commands, ms) {
                // Random ping

                if (args[2] === undefined) { 
                    message.channel.send("Must specify number of winners.")
                    return
                }

                if (!message.member.hasPermission('ADMINISTRATOR')) {
                    message.channel.send("Must be a server administrator to use this command (preventing against spam pinging)")
                    return
                }
                
                //console.log("Ran.")

                if ( args[1] !== undefined ) {
                    // We have a role mention.
                    //console.log("In.")
                    var sentMessage = await message.channel.send("**Analysing...**")

                    //var guild = await message.guild.fetchMembers();
                    var MemberObject = message.guild.roles.cache.get(args[1]).members
                    
                    // console.log( MemberObject )
                    var ArrayNum = 0;
                    var ArrayRar = []

                    MemberObject.forEach(function(test) {
                        ArrayRar[ArrayNum] = test.user.id;

                        ArrayNum++;
                    })
                    
                    var ArrayWinners = [];
                    
                    //console.log(ArrayRar)
                    var NumberOfWinners = parseInt(args[2]);
                    var CollectedWinners = 0;
                    while ( CollectedWinners !== NumberOfWinners ) {
                        //console.log("In while loop")
                        let selectedUser = ArrayRar[module.exports.functions.random(0,ArrayNum)]

                        if (!ArrayWinners.includes(selectedUser)) {
                            ArrayWinners[CollectedWinners] = selectedUser
                            //console.log(ArrayWinners[CollectedWinners])
                            CollectedWinners++;
                            //console.log("User selected")
                        } else {
                            //console.log("Duplicate user found, skipping")
                        }

                        if (CollectedWinners >= NumberOfWinners) {
                            //console.log('winners collected')
                            break;
                        }
                    }
                    
                    var Finalmsg = ""
                    ArrayWinners.forEach(function(winnerID) {
                        Finalmsg += ("<@" + winnerID + "> ")
                    })

                    //var RandomAnalysis = ArrayRar[module.exports.functions.random(0,ArrayNum)]

                    message.channel.send(Finalmsg)
                    
                    sentMessage.edit("Analysis completed.")
                } else {
                    message.channel.send("Must provide a proper role mention. Please make sure this role is mentionable (you can make it unmentionable after running this command).")
                }

            }
        },
        "gw-start": {
            pretty_name: "gw-start",
            description: "Start a giveaway.",
            command_function: function (message, args, serverQueue, Discord, client, search, ytdl, YTDL_OPTS, queue, BOT_CONFIG, commands, ms) {
                const gArgs = message.content.slice(BOT_CONFIG.bot_prefix.length).trim().split(/ +/g)
                if (message.author.id == message.guild.ownerID) {
                    client.giveawaysManager.start(message.channel, {
                        time: ms(args[1]),
                        prize: args.slice(3).join(" "),
                        winnerCount: parseInt(args[2]),
                        messages: {
                            giveaway: "\n\n🎉🎉 **GIVEAWAY** 🎉🎉",
                            giveawayEnded: "\n\n🎉🎉 **GIVEAWAY ENDED** 🎉🎉",
                            timeRemaining: "Time remaining: **{duration}**!",
                            inviteToParticipate: "React with 🎉 to participate!",
                            winMessage: "Congratulations, {winners}! You won **{prize}**!",
                            embedFooter: "Giveaways",
                            noWinner: "Giveaway cancelled, no valid participations.",
                            hostedBy: "Hosted by: {user}",
                            winners: "winner(s)",
                            endedAt: "Ended at",
                            units: {
                                seconds: "seconds",
                                minutes: "minutes",
                                hours: "hours",
                                days: "days",
                                pluralS: false // Not needed, because units end with a S so it will automatically removed if the unit value is lower than 2
                            }
                        }
                    }).then((gData) => {
                        //console.log(gData); // {...} (messageid, end date and more)
                    });
                }
    
                // And the giveaway has started!
            }
        },
        "gw-reroll": {
            pretty_name: "gw-reroll",
            description: "Reroll a giveaway.",
            command_function: function (message, args, serverQueue, results, ytdl, queue, Discord, client, BOT_CONFIG) {
                let messageID = args[1];

                if (message.author.id == message.guild.ownerID) {
                    client.giveawaysManager.reroll(messageID).then(() => {
                        message.channel.send("Success! Giveaway rerolled!");
                    }).catch((err) => {
                        message.channel.send("No giveaway found for "+messageID+", please check and try again");
                    });
                }
            }
        },
        "gw-delete": {
            pretty_name: "gw-delete",
            description: "Deletes a giveway.",
            command_function: function (message, args, serverQueue, results, ytdl, queue, Discord, client, BOT_CONFIG) {
                let messageID = args[1];

                if (message.author.id == message.guild.ownerID) {
                    client.giveawaysManager.delete(messageID).then(() => {
                        message.channel.send("Success! Giveaway deleted!");
                    }).catch((err) => {
                        message.channel.send("No giveaway found for "+messageID+", please check and try again");
                    });
                }
            }
        }
    }
}