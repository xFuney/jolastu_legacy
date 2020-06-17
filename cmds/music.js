module.exports = {
    categoryName: "Music",
    categoryDescription: "Play music with the bot.",
    initTasks: function() {
        // Do stuff on initialisation.
        console.log("Command object initialisation tasks are here!")
    },
    functions: {
        str_pad_left: function(string, pad, length) {
            // Pads a string to the left.
            return (new Array(length + 1).join(pad) + string).slice(-length);
        },
        playMusic: async function (message, args, serverQueue, results, ytdl, queue, Discord, client, BOT_CONFIG) {
            var checkResult = true;
            var currentResult = 0;
        
            while (checkResult) {
                console.log("[AUD] [YT] Getting video link from first result of YT search.")
                var link_result = results[currentResult].link
        
                // Check if its a channel
                console.log("[AUD] [YT] Checking if our result is a YT channel...")
                var chanCheck = results[currentResult].link
                chanCheck = String(chanCheck).match(/(channel)/)
                console.log(chanCheck)
                if (chanCheck) {
                    // it's a channel
                    console.log("[AUD] [YT] This result is a YouTube channel.")
                    if(currentResult > 1) {
                        // end it
                        console.log("[AUD] [YT] Out of results, mark as failure.")
                        checkResult = false;
                    }
                    // so its a channel and we aint done, add 1
                    console.log("[AUD] [YT] Adding one to result and inspecting other result.")
                    currentResult++
                } else {
                    console.log("[AUD] [YT] Found a non-channel - marking as complete.")
                    checkResult = false
                }
            }
        
            if (chanCheck) {
                return false;
            }
        
            // Get the information on the video from the search.
            console.log("[AUD] [YT] Getting information about the link using YTDL.")
            const songInfo = await ytdl.getInfo(link_result)
        
            // Get the video link from the first result of a YT search.
        
            const voice_channel = message.member.voice.channel;
            
            // Set voice channel.
            console.log("[AUD] [INIT] Setting current voice channel, if any.")
        
            console.log("[AUD] [INIT] Creating song table for addition to the server queueset.")
            // Initialise song table for addition to queueset.
            const song = {
                title: songInfo.title,
                url: results[currentResult].link,
                length_seconds: songInfo.length_seconds,
                requester: message.author.tag,
                description: results[currentResult].description
            }
            
            // Check for a server queue, if there isn't one - make one.
            if (!serverQueue) {
                // Make a queue construct for this server.
                console.log("[AUD] [CREATE] No server queue for guild id " + message.guild.id + ", creating one now.")
                const queueConstruct = {
                    textChannel: message.channel,
                    voiceChannel: voice_channel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true
                }
                
                // Gives the guild a queue to add/remove songs.
                queue.set(message.guild.id, queueConstruct)
                console.log("[AUD] [CREATE] Server queue created for guild ID " + message.guild.id + ".")
                // Push the song table that we made to the queue.
                queueConstruct.songs.push(song);
                console.log("[AUD] [ADD] Song added to queue successfully for guild ID " + message.guild.id + ".")
        
                try {
                    console.log("[AUD] [CONNECT] Attempting to join voice channel on guild ID " + message.guild.id + ".")
                    var connection = await voice_channel.join()
                    console.log("[AUD] [CONNECT] Connection attempt successful for guild ID " + message.guild.id + ", starting music.")
                    queueConstruct.connection = connection;
                    module.exports.functions.play(message.guild, queueConstruct.songs[0], queue, ytdl, Discord, client, BOT_CONFIG);
                } catch(err) {
                    // Error occurred whilst making queue.
                    console.log("[ERROR] Failure to establish connection: " + err)
                    //SYS_FN_OUTERR("message", message, "Failure to establish connection to voice channel.", "Please report this error to a bot administrator:\n```" + err + "```")
                    queue.delete(message.guild.id);
                }
            } else {
                serverQueue.songs.push(song);
        
                console.log("[AUD] [OUT] Calculating length of track for text output.")
                // Get length of track.
                var time = songInfo.length_seconds
            
                // Calculate hours, minutes, seconds.
                var hours = Math.floor(time / 3600);
                time = time - hours * 3600;
                var minutes = Math.floor(time / 60);
                var seconds = time - minutes * 60;
            
                // Parse those variables into one string to send.
                var finalTime = module.exports.functions.str_pad_left(minutes,'0',2)+':'+module.exports.functions.str_pad_left(seconds,'0',2);
                
                console.log("[AUD] [OUT] Creating and sending embed to appropriate channel for guild " + message.guild.id + ".")
                // Send embed to user saying that their song has been added
                var addedEmbed = new Discord.MessageEmbed()
                    .setColor('#00FF00')
                    .setTitle(results[currentResult].title)
                    .setAuthor('Successfully added to queue', BOT_CONFIG.bot_image)
                    .setDescription(results[currentResult].description)
                    .addFields(
                        {
                            "name": "Link",
                            "value": "[" + results[0].link + "](" + results[0].link + ")",
                            "inline": false
                        },
                        {
                            "name": "Requested by",
                            "value": song.requester,
                            "inline": true
                        },
                        {
                            "name": "Length",
                            "value": finalTime,
                            "inline": true
                        }
                    )
                    .setTimestamp()
                    .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
        
                // Send this newly crafted embed to the user.
                return message.channel.send(addedEmbed);
            }
        },
        play: function(guild, song, queue, ytdl, Discord, client, BOT_CONFIG) {
            // This function plays the song for the specific guild.
            // Get the queue for the guild we're playing for.
            console.log("[AUD] [PLAY] Playing song for guild ID " + guild.id)
            console.log("[AUD] [PLAY] Getting queue.")
            const serverQueue = queue.get(guild.id);
        
            // This statement checks if there are no songs left and that the user wants the bot to leave the call after it has finished music.
            if (!song) {
                console.log("[AUD] [LEAVE] Leaving voice channel on guild " + guild.id + " and deleting queue.")
                serverQueue.voiceChannel.leave();
                queue.delete(guild.id);
                return;
            }
        
            // Initialise dispatcher to play music.
            console.log("[AUD] [PLAY] Initialising dispatcher to play music for guild " + guild.id)
            const dispatcher = serverQueue.connection
                .play( ytdl(song.url, {
                    highWaterMark: 1024 * 1024 * 10 // 10 megabytes
                }) )
                .on("finish", () => {
                    // Shift the queue up one, and recurse this function.
                    console.log("[AUD] [PLAY] Video finished for guild " + guild.id + ", shifting song queue and playing next song (if any).")
                    serverQueue.songs.shift();
                    module.exports.functions.play(guild, serverQueue.songs[0],queue,ytdl,Discord,client,BOT_CONFIG);
                })
                .on("error", (error) => {
                    console.log("[ERROR] [DISPATCHER] Error playing music to guild ID " + guild.id + ": " + error)
                    //SYS_FN_OUTERR("queue", serverQueue, "Failure to create dispatcher.", "Please report this error to a bot administrator:\n```" + error + "```")
                });
            
            console.log("[AUD] [VOL] Audio volume set to " + serverQueue.volume + " for guild " + guild.id + ".")
            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        
            console.log("[AUD] [OUT] Calculating length of track for text output.")
            // Get length of track.
            var time = song.length_seconds
        
            // Calculate hours, minutes, seconds.
            var hours = Math.floor(time / 3600);
            time = time - hours * 3600;
            var minutes = Math.floor(time / 60);
            var seconds = time - minutes * 60;
        
            // Parse those variables into one string to send.
            var finalTime = module.exports.functions.str_pad_left(minutes,'0',2)+':'+module.exports.functions.str_pad_left(seconds,'0',2);
            
            console.log("[AUD] [OUT] Creating and sending embed to appropriate channel for guild " + guild.id + ".")
            const playingEmbed = new Discord.MessageEmbed()
                .setColor('7289da')
                .setTitle(song.title)
                .setAuthor('Now Playing', BOT_CONFIG.bot_image)
                .setDescription(song.description)
                .addFields(
                    {
                        "name": "Link",
                        "value": "[" + song.url + "](" + song.url + ")",
                        "inline": false
                    },
                    {
                        "name": "Requested by",
                        "value": song.requester,
                        "inline": true
                    },
                    {
                        "name": "Length",
                        "value": finalTime,
                        "inline": true
                    }
                )
                .setTimestamp()
                .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
        
             serverQueue.textChannel.send(playingEmbed);
        }        
    },
    commands: {
        "disconnect": {
            pretty_name: "disconnect",
            description: "Disconnects the bot from the voice channel, regardless of queue.",
            command_function: async function(message,args,serverQueue,Discord,client,search,ytdl,opts,queue,BOT_CONFIG) {
                if (!message.member.voice.channel) {
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor('ff0000')
                        .setTitle("Cannot disconnect!")
                        .setAuthor('Fatal Exception', BOT_CONFIG.bot_image)
                        .setDescription("You must be in a voice channel to disconnect.")
                        .setTimestamp()
                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                        message.channel.send(exampleEmbed)
                    return false
                }
    
                if (!serverQueue) {
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor('ff0000')
                        .setTitle("Cannot disconnect!")
                        .setAuthor('Fatal Exception', BOT_CONFIG.bot_image)
                        .setDescription("I'm pretty sure I'm not connected.")
                        .setTimestamp()
                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                        message.channel.send(exampleEmbed)
                    return false
                }
    
                serverQueue.connection.dispatcher.end();
                var connection = await VoiceChannel.leave()
                serverQueue = [];
    
                // END OF DISCONNECT //
            }
        },
        "queue": {
            pretty_name: "queue",
            description: "View the current queue.",
            command_function: async function(message, args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG) {
                if (!serverQueue) {
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor('ff0000')
                        .setTitle("Cannot get queue!")
                        .setAuthor('Fatal Exception', BOT_CONFIG.bot_image)
                        .setDescription("No queue currently exists for this server. Try playing something first.")
                        .setTimestamp()
                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                        message.channel.send(exampleEmbed)
                    return false
                }
                
                var i
                var songQueue = serverQueue.songs
                var currentDesc = "";
                if (songQueue.length > 1) {
                    for (i = 1; i < songQueue.length; i++) {
                        currentDesc = currentDesc + "**" + i + ".** " + "_ [" + serverQueue.songs[i].title + "](" + serverQueue.songs[i].url + "), requested by " + serverQueue.songs[i].requester + ". _\n"
                    }
                } else {
                    currentDesc = "_No songs in queue._"
                }
    
                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('7289da')
                    .setAuthor('Now Playing', BOT_CONFIG.bot_image)
                    .setDescription("_[" + serverQueue.songs[0].title + "](" + serverQueue.songs[0].url + "), requested by " + serverQueue.songs[0].requester + "._")
                    .addField('**Current Queue**', currentDesc, false)
                    .setTimestamp()
                    .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
      
            
                message.channel.send(exampleEmbed)
            }
        },
        "np": {
            pretty_name: "np",
            description: "Check what is currently playing.",
            command_function: async function(message, args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG) {
                if (!serverQueue) {
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor('ff0000')
                        .setTitle("Cannot get queue!")
                        .setAuthor('Fatal Exception', BOT_CONFIG.bot_image)
                        .setDescription("No queue currently exists for this server. Try playing something first.")
                        .setTimestamp()
                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                        message.channel.send(exampleEmbed)
                    return false
                }
    
                var song = serverQueue.songs[0]
                var time = song.length_seconds
    
                var hours = Math.floor(time / 3600);
                time = time - hours * 3600;
                var minutes = Math.floor(time / 60);
                var seconds = time - minutes * 60;
    
    
                var finalTime = module.exports.functions.str_pad_left(minutes,'0',2)+':'+module.exports.functions.str_pad_left(seconds,'0',2);
                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('7289da')
                    .setTitle(song.title)
                    .setAuthor('Now Playing', BOT_CONFIG.bot_image)
                    .setDescription(song.description)
                    .addFields(
                        {
                            "name": "Link",
                            "value": "[" + song.url + "](" + song.url + ")",
                            "inline": false
                        },
                        {
                            "name": "Requested by",
                            "value": song.requester,
                            "inline": true
                        },
                        {
                            "name": "Length",
                            "value": finalTime,
                            "inline": true
                        }
                    )
                    .setTimestamp()
                    .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
    
                message.channel.send(exampleEmbed)                
            }
        },
        "play": {
            pretty_name: "play",
            description: "Play a youtube link using the bot.",
            command_function: async function(message, args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG) {
                const voice_channel = message.member.voice.channel
                
                if (!voice_channel) {
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor('ff0000')
                        .setTitle("Cannot play!")
                        .setAuthor('Fatal Exception', BOT_CONFIG.bot_image)
                        .setDescription("You must be in a voice channel in order to start playing music.")
                        .setTimestamp()
                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                        message.channel.send(exampleEmbed)
                    return false  
                }
    
                const permissions = voice_channel.permissionsFor(message.client.user);
                if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor('ff0000')
                        .setTitle("Cannot play!")
                        .setAuthor('Fatal Exception', BOT_CONFIG.bot_image)
                        .setDescription("I need the permission to join and speak in the voice channel you are currently in to play music.")
                        .setTimestamp()
                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                        message.channel.send(exampleEmbed)
                    return false  
                }
    
                var link = ""
                var i;
                var query = ""
    
                for (i = 1; i < args.length; i++) {
                    query = query + args[i] + " "
                }
                
                console.log(query)
                search(query, opts) 
                    .then((results) => {
                        console.log(results);
                        module.exports.functions.playMusic(message,args,serverQueue,results,ytdl,queue,Discord,client,BOT_CONFIG);
                    });
    
                // END OF PLAY //
            }
        },
        "skip": {
            pretty_name: "skip",
            description: "Skip a song.",
            command_function: async function(message, args, serverQueue, Discord, client, search, ytdl, opts, queue, BOT_CONFIG) {
                if (!message.member.voice.channel) {
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor('ff0000')
                        .setTitle("Cannot skip!")
                        .setAuthor('Fatal Exception', BOT_CONFIG.bot_image)
                        .setDescription("You must be in a voice channel to skip a track!")
                        .setTimestamp()
                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                        message.channel.send(exampleEmbed)
                    return false
                }
    
                if (!serverQueue) {
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor('ff0000')
                        .setTitle("Cannot skip!")
                        .setAuthor('Fatal Exception', BOT_CONFIG.bot_image)
                        .setDescription("There is no songs to skip.")
                        .setTimestamp()
                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                        message.channel.send(exampleEmbed)
                    return false
                }
    
                if (message.member.roles.cache.some(role => role.name === 'DJ') || message.member.id == message.guild.ownerID ) {
                    serverQueue.connection.dispatcher.end();
                } else {
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor('ff0000')
                        .setTitle("Cannot skip!")
                        .setAuthor('Fatal Exception', BOT_CONFIG.bot_image)
                        .setDescription("You don't have the DJ Role")
                        .setTimestamp()
                        .setFooter('Brought to you by ' + BOT_CONFIG.bot_name);
                    
                        message.channel.send(exampleEmbed)
                        return false	
                }
            }
        }           
    },
}