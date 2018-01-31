const Discord = require('discord.js');
const { RichEmbed } = require('discord.js');
const bot = new Discord.Client();
const prefix = "!";
//To allow youtube videos to play
const YTDL = require("ytdl-core");
var servers = {};

//Function to allow the bot to play
function play(connection, message){
    //Gets the server ID
    var server = servers[message.guild.id];
    //Adds the stream to the queue, filtering the yt link to the audio only
    server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));
    //Shifts the queue and goes to the song put in the queue
    server.queue.shift();
    //If nothing is in the queue, the bot disconnects, otherwise play what the user has inputted
    server.dispatcher.on("end", function(){
        if(server.queue[0]){
          play(connection, message);
        //If nothings left in the playlist  
        }else{
            connection.disconnect();
        }
    });
}

//When the bot successfully connects, gives a message to the console that it has connected to the channel and set the activity to what the bots doing
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    bot.user.setActivity("Bot Simulator");
});

//While the bots on...
bot.on('message', (message) => {
    //Banned words in the discord
    var bannedWord = ["yeetya", "oof", "poop", "league", "baddie", "heck"];
    //Goes through the array of 'bad' words and if any part of the message contains it, the bot deletes the message and explain why
    for(var i in bannedWord){
            if(!String(message).match("!help")){
                if(String(message).match(bannedWord[i])){
                    message.delete()
                    .then(msg => console.log(`Deleted message from ${msg.author}`))
                    .catch(console.error);
                    message.channel.sendMessage('Bee Bop, word not allowed in this discord'); 
                }                               
            }
    }


    if(message.author.equals(bot.user)) return;
    if(!message.content.startsWith(prefix)) return;

    //Splits the command the user inputted in order to allow us to see what command they are trying to do
    var command = message.content.substring(prefix.length).split(" ");

    switch(command[0].toLowerCase()){
        case "yeet":
            message.channel.sendMessage("YA");
            break;
        //Embeds and neatly displays the bot information
        case "botinfo":
            const embedBot = new RichEmbed()
                .setColor("#9999ff")
                .addField("Amazing Bot Information", "---------------------------------")
                .addField("Creation Day", "January 23rd, 2018 at 3:15pm")
                .addField("Author", "Nicholas Laranjeiro")                       
            return message.channel.send(embedBot);
            break;
        //Embeds and neatly displays the server information
        case "serverinfo":
            const embedServer = new RichEmbed()
                .setColor("#9999ff")
                .addField("Server Information", "---------------------------------")
                .addField("Server Name", message.guild.name)
                .addField("Created On", message.guild.createdAt)
                .addField("You Joined", message.member.joinedAt)
            .addField("Total Members", message.guild.memberCount);
            return message.channel.send(embedServer);
            break;
        //Displays user avatar
        case "avatar":
            //If user has the default avatar gives a message saying they cant display anything because there is nothing to be displayed otherwise it gets displayed
            if(message.author.avatarURL != null){
                message.channel.send(message.author.avatarURL);  
            }else{
                message.channel.send("Cannot display default picture");
            }            
            break;
        //Rolls a 20 sided dice
        case "roll":
            var roll = Math.floor(Math.random()*20) + 1;
            message.reply("You rolled a " + roll);
            break;
        //Plays the youtube video the user gives
        case "play":
            //If no youtube link is given, the bot asks for oen
            if(!command[1]){
                message.channel.send("Please provide a link or a proper one");                
                return;
            }
            if(command[1][12] != "y"){
                message.channel.send("Must be a youtube link");
                return;
            }
            //If they try playing a video without being in a voice channel, the bot tells them that they have to in order for it to play the video
            if(!message.member.voiceChannel){
                message.channel.send("You must be in a voice channel");
                return;                
            }
            //Otherwise adds it to the queue
            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            };
            //Adds to the list of servers  
            var server = servers[message.guild.id];

            //Adds it to the queue
            server.queue.push(command[1]);

            //If not connected to the voice channel, joins the channel and plays the link given
            if(!message.guild.voiceConnection){ 
                message.member.voiceChannel.join().then(function(connection){
                    play(connection, message);
                })
            }
            break;
        //Skips a song
        case "skip":
            var server = servers[message.guild.id];            
            if(server.dispatcher){
                server.dispatcher.end();
            }
            break;
        //Resumes a song
        case "resume":
            var server = servers[message.guild.id];            
            if(server.dispatcher){
                message.member.voiceChannel.connection.dispatcher.resume();
            }
            break;
        //Stops the song
        case "stop":
            var server = servers[message.guild.id];                
            if(server.dispatcher){
                message.member.voiceChannel.connection.dispatcher.pause();
            }
            break;
        //Makes the bot leave the voice channel
        case "leave":                            
            message.member.voiceChannel.leave();           
            break;
        //If they dont input a proper command, a response is given
        default:
            message.channel.send("Invalid command");
    }
});

bot.login('ommited');
