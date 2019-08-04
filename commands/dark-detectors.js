const Discord = require("discord.js");

module.exports = {
  name: "dark-detectors",
  description: "View a list of this guild's dark detectors",
  aliases: ["darkdetectors", "dark_detectors"],
  async execute(message, args, bot) {
    const guildInfo = await bot.guildInfo.get(bot, message.guild);
    if (guildInfo.darkDetectors.length <= 0) return message.channel.send("No dark detectors have been reported in this server.");

    const pageLength = 9;
    const pages = [];
    const darkDetectorsCopy = [...guildInfo.darkDetectors];

    for (let i = 0; i < darkDetectorsCopy.length; i += pageLength) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`Page ${(i / 9) + 1}/${Math.ceil(darkDetectorsCopy.length / 9)}`)
        .setColor(message.guild.me.displayAvatarURL)
        .setTimestamp();

      const darkDetectors = guildInfo.darkDetectors.splice(0, pageLength);
      for (const darkDetector of darkDetectors) {
        embed.addField("\u200b", `**Amount:** ${darkDetector.amount}\n**Location:** ${darkDetector.fortress}`);
      }

      pages.push(embed);
    }

    const msg = await message.channel.send(pages[0]);

    if (pages.length <= 1) return;

    await msg.react("◀");
    await msg.react("▶");

    let page = 1;

    const filter = (reaction, user) => ["◀", "▶"].includes(reaction.emoji.name) && user.id === message.author.id;
    const reactionCollector = msg.createReactionCollector(filter, {
      time: 120000
    });

    reactionCollector.on("collect", collected => {
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
