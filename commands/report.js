const Discord = require("discord.js");

module.exports = {
  name: "report",
  description: "Report a foundable.",
  aliases: ["r"],
  async execute(message, args, bot) {
    if (!args[0]) return message.channel.send("Specify a threat level to report! Possible Threat Levels: `emergency`, `severe`, `high`, `medium`, or `low`");
    if (!args[1]) return message.channel.send("Specify details about the foundable!");

    const threatLevels = ["emergency", "severe", "high", "medium", "low"];
    if (!threatLevels.some(i => i.includes(args[0]))) return message.channel.send("Invalid threat level!");

    const threatLevel = threatLevels.find(i => args[0].includes(i));

    if (!message.guild.roles.find(r => r.name.toLowerCase() === threatLevel)) {
      await message.guild.createRole({
        name: threatLevel,
        mentionable: true
      });
    }

    const guildInfo = await bot.guildInfo.get(bot, message.guild);

    const reportInfo = {
      details: args.slice(1).join(" "),
      threatLevel: threatLevel,
      user: message.member.id,
      time: Date.now(),
      archived: false
    };

    if (guildInfo.poi.some(p => args.slice(1).join(" ").includes(p.name.toLowerCase())) || guildInfo.poi.some(p => p.aliases.find(a => a.toLowerCase() === args.slice(1).join(" ")))) {
      const poi = guildInfo.poi.find(f => args.slice(1).join(" ").includes(f.name.toLowerCase())) || guildInfo.poi.find(p => p.aliases.find(a => a.toLowerCase() === args.slice(1).join(" ")));
      reportInfo.location = `${poi.latitude},${poi.longitude}`;
    }

    const reportRole = await message.guild.roles.find(r => r.name.toLowerCase() === threatLevel);

    const googleMapsLink = reportInfo.location ? `https://www.google.com/maps/place/${reportInfo.location}` : `https://www.google.com/maps/search/${reportInfo.details.split(/ +/).join("+")}${guildInfo.location.location.length > 0 ? `+${guildInfo.location.location.split(/ +/).join("+")}` : ""}`;
    const appleMapsLink = reportInfo.location ? `http://maps.apple.com/?daddr=${reportInfo.location}` : `http://maps.apple.com/?q=SEARCH${reportInfo.details.split(/ +/).join("+")}${guildInfo.location.location.length > 0 ? `+${guildInfo.location.location.split(/ +/).join("+")}` : ""}`;
    const wazeLink = reportInfo.location ? `http://waze.to/?ll=${reportInfo.location}` : `http://waze.to/?q=${reportInfo.details.split(/ +/).join("+")}${guildInfo.location.location.length > 0 ? `+${guildInfo.location.location.split(/ +/).join("+")}` : ""}`;

    const reportEmbed = new Discord.RichEmbed()
      .setAuthor(`A foundable with a${threatLevel === "emergency" ? "n" : ""} ${threatLevel} threat level has been reported by ${message.member.displayName}!`, message.author.displayAvatarURL)
      .setColor(message.guild.me.displayHexColor)
      .addField("Details", reportInfo.details, true)
      .addField("Directions", `[Google Maps](${googleMapsLink}), [Apple Maps](${appleMapsLink}), [Waze](${wazeLink}) ${!reportInfo.location ? "(Unknown location, these directions may be incorrect.)" : ""}`, true)
      .setTimestamp();

    message.channel.send(reportRole, reportEmbed);

    const usersData = await bot.userInfo.get(bot, message.author, message.guild);

    usersData.reports.push(reportInfo);

    bot.userInfo.set(bot, {
      reports: usersData.reports
    }, message.author, message.guild);

    guildInfo.reports.push(reportInfo);

    bot.guildInfo.set(bot, {
      reports: guildInfo.reports
    }, message.guild);

  },
};
