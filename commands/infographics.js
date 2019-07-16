const Discord = require("discord.js");

module.exports = {
  name: "infographics",
  description: "A list of infographics to view",
  aliases: ["infographic"],
  async execute(message, args, bot) {
    const infographics = ["https://i.imgur.com/16NiBBG.jpg", "https://i.imgur.com/B1jjD05.jpg", "https://i.imgur.com/dLZ3fDs.jpg"];
    let page = 1;

    const infographicEmbed = new Discord.RichEmbed()
      .setAuthor(`Infographic #${page}/${infographics.length}`, message.author.displayAvatarURL)
      .setImage(infographics[0])
      .setColor(message.guild.me.displayHexColor)
      .setTimestamp();

    message.channel.send(infographicEmbed).then(async msg => {
      await msg.react("⏮");
      await msg.react("◀");
      await msg.react("▶");
      await msg.react("⏭");

      const reactionFilter = (reaction, user) => (reaction.emoji.name === "◀" || reaction.emoji.name === "▶" || reaction.emoji.name === "⏮" || reaction.emoji.name === "⏭") && user.id === message.author.id;
      const reactionCollector = msg.createReactionCollector(reactionFilter, {
        time: 120000
      });

      reactionCollector.on("collect", async collected => {
        if (collected.emoji.name === "◀") {
          if (page === 1) return msg.reactions.find(emoji => emoji.emoji.name === "◀").remove(message.author);
          page--;

          infographicEmbed.setAuthor(`Infographic #${page}/${infographics.length}`, message.author.displayAvatarURL);
          infographicEmbed.setImage(infographics[page - 1]);

          await msg.edit(infographicEmbed);
          msg.reactions.find(emoji => emoji.emoji.name === "◀").remove(message.author);
        } else if (collected.emoji.name === "▶") {
          if (page === infographics.length) return msg.reactions.find(emoji => emoji.emoji.name === "▶").remove(message.author);
          page++;

          infographicEmbed.setAuthor(`Infographic #${page}/${infographics.length}`, message.author.displayAvatarURL);
          infographicEmbed.setImage(infographics[page - 1]);

          await msg.edit(infographicEmbed);
          msg.reactions.find(emoji => emoji.emoji.name === "▶").remove(message.author);
        } else if (collected.emoji.name === "⏮") {
          if (page === 1) return msg.reactions.find(emoji => emoji.emoji.name === "⏮").remove(message.author);
          page = 1;

          infographicEmbed.setAuthor(`Infographic #${page}/${infographics.length}`, message.author.displayAvatarURL);
          infographicEmbed.setImage(infographics[page - 1]);

          await msg.edit(infographicEmbed);
          msg.reactions.find(emoji => emoji.emoji.name === "⏮").remove(message.author);
        } else if (collected.emoji.name === "⏭") {
          if (page === infographics.length) return msg.reactions.find(emoji => emoji.emoji.name === "⏭").remove(message.author);
          page = infographics.length;

          infographicEmbed.setAuthor(`Infographic #${page}/${infographics.length}`, message.author.displayAvatarURL);
          infographicEmbed.setImage(infographics[page - 1]);

          await msg.edit(infographicEmbed);
          msg.reactions.find(emoji => emoji.emoji.name === "⏭").remove(message.author);
        }
      });

      reactionCollector.on("end", () => {
        msg.clearReactions();
        infographicEmbed.setFooter("The reaction menu has expired.");
        msg.edit(infographicEmbed);
      });
    });
  },
};
