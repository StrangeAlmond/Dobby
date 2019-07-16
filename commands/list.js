const Discord = require("discord.js");
const sm = require("string-similarity");
const plural = require("plural");

module.exports = {
  name: "list",
  description: "List reports",
  async execute(message, args, bot) {
    const items = ["emergency", "severe", "high", "medium", "low"];

    async function list(type) {
      const guildInfo = await bot.guildInfo.get(bot, message.guild);

      let foundableReports = [...guildInfo.reports];
      const embeds = [];

      if (type && items.includes(type.toLowerCase())) foundableReports = foundableReports.filter(r => r.threatLevel === type);

      const pageLength = 9;

      for (let i = 0; i < foundableReports.length; i += pageLength) {
        const reportsEmbed = new Discord.RichEmbed()
          .setAuthor(`${items.includes(type) ? `${plural(type).charAt(0).toUpperCase() + plural(type).slice(1)} Reported` : "Foundables Reported"}, Page ${(i / pageLength) + 1}`, message.guild.iconURL)
          .setColor(message.guild.me.displayHexColor)
          .setTimestamp();

        const reports = foundableReports.splice(i, i + pageLength);

        for (let j = 0; j < reports.length; j++) { // Add a field to the embed for each report
          const report = reports[j];
          const id = j + 1;
          const threatLevel = report.threatLevel.charAt(0).toUpperCase() + report.threatLevel.slice(1);

          const googleMapsLink = report.location ? `https://www.google.com/maps/place/${report.location}` : `https://www.google.com/maps/search/${report.details.split(/ +/).join("+")}`;
          const appleMapsLink = report.location ? `http://maps.apple.com/?daddr=${report.location}` : `http://maps.apple.com/?q=SEARCH${report.details.split(/ +/).join("+")}`;
          const wazeLink = report.location ? `http://waze.to/?ll=${report.location}` : `http://waze.to/?q=times+square${report.details.split(/ +/).join("+")}`;

          const directions = `[Google Maps](${googleMapsLink}), [Apple Maps](${appleMapsLink}), [Waze](${wazeLink}) ${!report.location ? " (Unknown location)" : ""}`;
          const details = report.details;

          reportsEmbed.addField("\u200b", `**ID:** ${id}\n**Threat Level:** ${threatLevel}\n**Directions:** ${directions}\n**Details:** ${details}`, true);
        }

        embeds.push(reportsEmbed);
      }

      if (!embeds[0]) {
        embeds[0] = new Discord.RichEmbed()
          .setAuthor("Page 1", message.guild.iconURL)
          .setDescription(`No ${items.includes(type) ? `${type} threat level foundables` : "Foundables"} have been reported in this server.`)
          .setColor(message.guild.me.displayHexColor)
          .setTimestamp();
      }

      message.channel.send(embeds[0]).then(async msg => {
        if (embeds.length > 1) {
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

              await msg.edit(embeds[page - 1]);
              msg.reactions.first().remove(message.author);

            } else {
              if (page === embeds.length) return msg.reactions.last().remove(message.author);
              page++;

              await msg.edit(embeds[page - 1]);
              msg.reactions.last().remove(message.author);
            }
          });

          reactionCollector.on("end", () => {
            msg.clearReactions();
            embeds[page - 1].setFooter("The reaction menu has expired.");
            msg.edit(embeds[page - 1]);
          });
        }
      });
    }

    if (!args[0]) {
      list();
    } else {
      let item = items.find(i => i === args[0]);
      if (!item) return message.channel.send("Invalid threat level, you must pick from `emergency/severe/high/medium/low`");
      item = item.target;

      list(item);
    }

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  },
};
