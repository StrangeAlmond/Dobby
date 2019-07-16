const Discord = require("discord.js");

module.exports = {
  name: "friend-codes",
  description: "View your server's list of friend codes",
  aliases: ["friendcodes", "friend-list", "friendlist", "friends"],
  async execute(message, args, bot) {
    let users = await bot.userInfo.findAll({
      where: {
        guild: message.guild.id
      }
    });

    users = users.filter(u => u.friendCode.length > 0);

    if (users.length <= 0) return message.channel.send("No users have set their friend code in this server yet.");
    const pageLength = 20;
    const embeds = [];

    for (let i = 0; i < users.length; i += pageLength) {
      const codes = [...users].splice(i, i + pageLength).map(u => `${message.guild.members.get(u.user).displayName}: **${chunk(u.friendCode, 4).join(" ")}**`);
      const codesEmbed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}'s Friend Codes`, message.guild.iconURL)
        .setDescription(codes)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      embeds.push(codesEmbed);
    }

    message.channel.send(embeds[0]).then(async msg => {
      if (embeds.length > 1) {
        let page = 1;
        await msg.react("◀");
        await msg.react("▶");

        const filter = (reaction, user) => ["▶", "◀"].includes(reaction.emoji.name) && user.id === message.author.id;
        const reactionCollector = msg.createReactionCollector(filter, {
          time: 120000
        });

        reactionCollector.on("collect", async collected => {
          if (collected.emoji.name === "◀") {
            if (page === 1) return msg.reactions.find(r => r.emoji.name === "◀").remove(message.author);
            page--;

            await msg.edit(embeds[page - 1]);

            msg.reactions.find(r => r.emoji.name === "◀").remove(message.author);
          } else if (collected.emoji.name === "▶") {
            if (page === embeds.length) return msg.reactions.find(r => r.emoji.name === "▶").remove(message.author);
            page++;

            await msg.edit(embeds[page - 1]);
            msg.reactions.find(r => r.emoji.name === "▶").remove(message.author);
          }
        });

        reactionCollector.on("end", () => {
          msg.clearReactions().catch(e => bot.logger.log("error", e));
          embeds[page - 1].setFooter("This reaction menu has expired.");
          msg.edit(embeds[page - 1]);
        });
      }
    });

    function chunk(str, n) {
      const ret = [];
      let i;
      let len;

      for (i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n));
      }

      return ret;
    }
  },
};
