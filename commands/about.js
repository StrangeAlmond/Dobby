const Discord = require("discord.js");
const botconfig = require("../botconfig.json");
const ms = require("parse-ms");

module.exports = {
  name: "about",
  description: "Shows the bots stats",
  async execute(message, args, bot) {
    // get the total amount of seconds, minutes, and hours the bot has been online
    const uptimeObject = ms(bot.uptime);
    const uptime = `${uptimeObject.days}d, ${uptimeObject.hours}h, ${uptimeObject.minutes}m, ${uptimeObject.seconds}s`;

    // Create a RichEmbed for it and send it
    const statsEmbed = new Discord.RichEmbed()
      .setColor(message.guild.me.displayHexColor)
      .setThumbnail(bot.user.displayAvatarURL)
      .addField("Uptime", `${uptime}`)
      .addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`)
      .addField("Version", botconfig.version)
      .addField("Library", `Discord.js v${Discord.version}`)
      .addField("Node.js", `${process.version}`)
      .addField("Stats", `Guilds: ${bot.guilds.size}\nChannels: ${bot.channels.size}\nUsers: ${bot.users.size}\nCommands: ${bot.commands.size}`)
      .addField("Official Server", "https://discord.gg/8dxg68T")
      .setFooter("© 2019 StrangeAlmond#0001", bot.user.displayAvatarURL)
      .setTimestamp();
    message.channel.send(statsEmbed);
  },
};
