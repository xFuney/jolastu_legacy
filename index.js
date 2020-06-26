// Jolastu v1
// Funey, 2020

// Require all necessary libraries from API folder
const fs = require('fs');
const apiDirectory = fs.readdirSync('./api').filter(file => file.endsWith('.js'));

const api = [];

for (const file of apiDirectory) {
    api[file.split('.').slice(0, -1).join('.')] = require("./api/" + file);
}

//console.log(api);

api.logging.log("APIs have been initialised successfully.");

// Use configuration management API to load the configuration.

const BOT_CONFIG = api.configuration.loadConfiguration("./bot_config.json");

//console.log(BOT_CONFIG);

api.logging.log("Initialising libraries for use...")

const queue = new Map(); // Not nonsensical, music queue.

const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require("ytdl-core");
const https = require('https');
var search = require("youtube-search-promise");


const ms = require("ms");

// Requires Manager from discord-giveaways
const { GiveawaysManager } = require("discord-giveaways");
// Starts updating currents giveaways
const manager = new GiveawaysManager(client, {
    storage: "./giveaways.json",
    updateCountdownEvery: 10000,
    default: {
        botsCanWin: false,
        exemptPermissions: [ "MANAGE_MESSAGES", "ADMINISTRATOR" ],
        embedColor: "#FF0000",
        reaction: "🎉"
    }
});

// We now have a giveawaysManager property to access the manager everywhere!
client.giveawaysManager = manager;

api.logging.log("Initialising commands...")

const commandsDirectory = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandsDirectory) {
    commands[file.split('.').slice(0, -1).join('.')] = require("./cmds/" + file);
    if (commands[file.split('.').slice(0, -1).join('.')].initTasks !== undefined) {
        // Run the initialisation task.
        commands[file.split('.').slice(0, -1).join('.')].initTasks();
    }
}

// MONITORING

// CPU Monitoring
if (BOT_CONFIG.bredo_servermon__enable) {
    const os = require('os-utils');
    const {exec} = require('child_process');

    const cpuThreshold = BOT_CONFIG.bredo_servermon__cpuThreshold
    const intervalSeconds =  BOT_CONFIG.bredo_servermon__intervalSeconds
    const ownerID =  BOT_CONFIG.bredo_servermon__sysop
    const channelID =  BOT_CONFIG.bredo_servermon__sysop_log_channel

    let cpuWarning = false
    let ownerAlerted = false

    function monitorCheck() {
        let channel = client.channels.cache.get(channelID)
        os.cpuUsage(function(v) {
            let currCpuUsage = Math.round(v * 100)
            if (currCpuUsage > cpuThreshold) {
                if ((!ownerAlerted) && (cpuWarning)) {

                    console.log('[MON] High CPU usage lasting over ${intervalSeconds} seconds has been detected. Info:')

                    exec("ps aux --sort=-pcpu | head -n 5", (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(stdout);
                    });

                    channel.send('<@' + ownerID + '>, CPU usage has been above threshold of ' + cpuThreshold + '% for more then ' + intervalSeconds + 'seconds (currently at ' + currCpuUsage + '%)')
                    ownerAlerted = true
                } else if (!cpuWarning && !ownerAlerted) {
                    //console.log('[MON] High CPU usage detected')
                    cpuWarning = true
                } else {
                    //console.log('[MON] CPU usage is still high, owner has been alerted')
                }
            } else {
                if (cpuWarning || ownerAlerted) {
                    //console.log('[MON] CPU usage has returned to normal')
                    cpuWarning = false
                    ownerAlerted = false
                }
            }
        });
    }

    setInterval(monitorCheck, intervalSeconds * 1000)
}


const YTDL_OPTS = {
    maxResults: 3,
    key: process.env.KEY_YT,
}
// Set appropriate tokens variable based on config.
const DISCORD_TOKEN = process.env.JOLASTU_PROD_DISCORD_TOKEN;

//console.log("Currently using development token");

if (BOT_CONFIG.bot_env == "prod") {
    const DISCORD_TOKEN = process.env.JOLASTU_PROD_DISCORD_TOKEN;
    //console.log("Using production token.")
} 

////console.log(commands)

client.on('message', msg => {
    // Regardless if this message is meant for us or not, run it through the antispam.
    //console.log("[MSG] Received message - running through antispam system.")
    //antiSpam.message(msg);

    //console.log("[MSG] Checking if this message was meant for us.")
    // Efficiency measure, make sure command is meant for us before even bothering to look.
    if (msg.content.substring(0,BOT_CONFIG.bot_prefix.length) == BOT_CONFIG.bot_prefix) {
        //console.log("[CMD] Message was intended for us, we can start parsing now.")
        // Remove the prefix from the command to ensure we can split arguments.
        //console.log("[CMD] Removing prefix to ensure argument split.")
        var ParsedMessage = msg.content.substring(BOT_CONFIG.bot_prefix.length, msg.content.length - BOT_CONFIG.bot_prefix.length + 2)
        //console.log("[CMD] ParsedMessage variable is currently " + ParsedMessage)
        // Split by spacebar, as that is our argument delimiter.
        //console.log("[CMD] Splitting parsed message to extract arguments.")
        var Arguments = ParsedMessage.split(" ")
        //console.log(Arguments)
        
        // We know that this is intended for us, so fully parse now.
        //console.log("[CMD] Starting full parse to run command...")
        var i;
        //console.log(commands)
        for (const catName in commands) {
            // So we're now getting category names, we can now refer to category objects!
            for (const commandName in commands[catName].commands) {
                let currentCmd = commands[catName].commands[commandName]

                if (Arguments[0] == commandName) {
                    // Execute
                    //console.log("[CMD] Executing...");
                    currentCmd.command_function(msg, Arguments, queue.get(msg.guild.id), Discord, client, search, ytdl, YTDL_OPTS, queue, BOT_CONFIG, commands, ms)
                }
            }
            
        }
    }
})

client.on('ready', () => {
    // Intentionally logged normally as to reaffirm user that botcode has loaded.
    console.log(`Bot has connected to Discord, and is currently logged in as ${client.user.tag}!`);
    
    client.user.setActivity('over the iPod Discord...', { type: 'WATCHING' });
});

client.login(DISCORD_TOKEN)
