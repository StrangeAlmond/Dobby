const Discord = require("discord.js");
const moment = require("moment-timezone");
const ms = require("parse-ms");
const tzlookup = require("tz-lookup");

module.exports = {
  name: "planted-list",
  description: "View a list of the planted seeds in this guild.",
  aliases: ["sprouting-list"],
  async execute(message, args, bot) {
    const guildData = await bot.guildInfo.get(bot, message.guild);
    if (guildData.planted.length <= 0) return message.channel.send("There are no planted seeds in this guild.");

    let planted = guildData.planted;
    if (args[0]) planted = planted.filter(p => p.greenhouse.includes(args.join(" ")) || p.seed.includes(args.join(" ")));

    planted = planted.map(p => `**ID:** ${guildData.planted.indexOf(p) + 1}\n**Greenhouse:** ${p.greenhouse.charAt(0).toUpperCase() + p.greenhouse.slice(1)}\n**Seed:** ${p.seed.charAt(0).toUpperCase() + p.seed.slice(1)} seed\n**Time:** ${p.sprouted ? timeSinceSprout(p.time) : timeUntilSprout(p.time)}`);

    if (planted.length <= 0) return message.channel.send("There are no planted seeds matching that search query.");

    const plantedCopy = [...planted];

    const pageLength = 6;
    const embeds = [];

    for (let i = 0; i < planted.length; i += pageLength) {
      const greenhouseEmbed = new Discord.RichEmbed()
        .setAuthor(`Page ${(i / pageLength) + 1}/${Math.ceil((planted.length / pageLength))}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      plantedCopy.splice(0, pageLength).forEach(greenhouse => {
        greenhouseEmbed.addField("\u200b", greenhouse, true);
      });

      embeds.push(greenhouseEmbed);
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

    function timeUntilSprout(time) {
      const hours = ms(time - Date.now()).hours;
      let minutes = ms(time - Date.now()).minutes;
      if (minutes < 1) minutes = 1;

      return `in ${hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""} and ` : ""} ${minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : ""}${guildData.location.coordinates.length > 0 ? ` (${moment(time.valueOf()).tz(tzlookup(guildData.location.coordinates.split(/, /g)[0], guildData.location.coordinates.split(/, /g)[1])).format("h:mm a")})` : ""}`;
    }

    function timeSinceSprout(time) {
      const hours = ms(Date.now() - time).hours;
      let minutes = ms(Date.now() - time).minutes;
      if (minutes < 1) minutes = 1;

      return `${hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""} and ` : ""} ${minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : ""} ago`;
    }
  },
};
