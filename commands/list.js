const Discord = require("discord.js");

module.exports = {
  name: "list",
  description: "List reports",
  async execute(message, args, bot) {
    const items = ["emergency", "severe", "high", "medium", "low"];

    const guildData = await bot.guildInfo.get(bot, message.guild);
    const unfilteredReports = [...guildData.reports];
    guildData.reports = guildData.reports.filter(r => !r.archived);

    if ((args[0] === "all" || args[1] === "all") && message.member.hasPermission("MANAGE_GUILDS")) {
      guildData.reports = unfilteredReports;
    } else if ((args[0] === "archived" || args[1] === "archived") && message.member.hasPermission("MANAGE_GUILDS")) {
      guildData.reports = unfilteredReports.filter(r => r.archived);
    }

    let reports = [...guildData.reports];

    const pages = [];
    const pageLength = 9;

    const type = items.find(i => i === args[0] || i === args[1]);

    if (type) reports = reports.filter(r => r.threatLevel === type);

    for (let i = 0; i < reports.length; i += pageLength) {
      const page = (i / pageLength) + 1;
      const embed = new Discord.RichEmbed()
        .setAuthor(`Page ${page}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      for (const report of reports.splice(i, i + pageLength)) {
        const googleMaps = report.location ? `https://www.google.com/maps/place/${report.location}` : `https://www.google.com/maps/search/${report.details.split(/ +/).join("+")}`;
        const waze = report.location ? `http://waze.to/?ll=${report.location}` : `http://waze.to/?q=times+square${report.details.split(/ +/).join("+")}`;
        const appleMaps = report.location ? `http://maps.apple.com/?daddr=${report.location}` : `http://maps.apple.com/?q=SEARCH${report.details.split(/ +/).join("+")}`;

        const directions = `[Google Maps](${googleMaps}), [Apple Maps](${appleMaps})\n[Waze](${waze})`;

        embed.addField("\u200b", `**ID:** ${unfilteredReports.indexOf(report) + 1}\n**Threat Level:** ${report.threatLevel}\n**Directions:** ${directions}\n**Details:** ${report.details}`);
      }

      pages.push(embed);
    }

    if (pages.length <= 0) {
      const embed = new Discord.RichEmbed()
        .setAuthor("No Foundables Found", message.guild.iconURL)
        .setDescription(`No ${items.includes(type) ? `${type} threat level foundables` : "Foundables"} have been reported in this server.`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      message.channel.send(embed);
      return;
    }

    const msg = await message.channel.send(pages[0]);

    if (pages.length === 1) return;

    await msg.react("◀");
    await msg.react("▶");

    let page = 1;

    const reactionFilter = (reaction, user) => (reaction.emoji.name === "◀" || reaction.emoji.name === "▶") && user.id === message.author.id;
    const reactionCollector = msg.createReactionCollector(reactionFilter, {
      time: 120000
    });

    reactionCollector.on("collect", async collected => {
      if (collected.emoji.name === "◀") {
        if (page === 1) return msg.reactions.first().remove(message.author);
        page--;

        msg.edit(pages[page - 1]);
        msg.reactions.first().remove(message.author);

      } else {
        if (page === pages.length) return msg.reactions.last().remove(message.author);
        page++;

        msg.edit(pages[page - 1]);
        msg.reactions.last().remove(message.author);
      }
    });

    reactionCollector.on("end", () => {
      pages[page - 1].setFooter("The reaction menu has expired.");

      msg.clearReactions();
      msg.edit(pages[page - 1]);
    });
  },
};
