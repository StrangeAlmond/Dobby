const Discord = require("discord.js");
const numeral = require("numeral");

module.exports = {
  name: "calc-xp",
  description: "Calcuate your total XP",
  aliases: ["calcuate-xp"],
  async execute(message, args, bot) {
    const levels = [0, 1000, 2500, 4500, 7500, 11500, 17500, 24500, 32500, 42500, 53500, 65000, 78500, 92500, 107500, 123500, 141500, 161500, 183500, 208500, 238500, 273500, 313500, 358500, 408500, 468500, 538500, 618500, 708500, 808500, 928500, 1068500, 1228500, 1408500, 1608500, 1828500, 2068500, 2328500, 2608500, 2908500, 3228500, 3568500, 3928500, 4308500, 4708500, 5158500, 5658500, 6208500, 6808500, 7508500, 8258500, 9058500, 9908500, 10808500, 11758500, 12758500, 13808500, 14908500, 16108500, 17608500];

    const guildData = await bot.guildInfo.get(bot, message.guild);
    const guildPrefix = guildData.settings.prefix;

    if (!args[0]) return message.channel.send(`Specify your level! Proper Usage: \`${guildPrefix}calc-xp <current level> <XP gained in that level>\``);
    if (isNaN(args[0])) return message.channel.send(`Invalid Level! Proper Usage: \`${guildPrefix}calc-xp <current level> <XP gained in that level>\``);

    const level = parseInt(args[0]);

    if (level <= 0 || level > 60) return message.channel.send(`Invalid Level! Proper Usage: \`${guildPrefix}calc-xp <current level> <XP gained in that level>\``);

    const baseXP = levels[level - 1];

    if (!args[1]) return message.channel.send(`Specify your xp gained in that level! Proper Usage: \`${guildPrefix}calc-xp <current level> <XP gained in that level>\``);
    if (isNaN(args[1])) return message.channel.send(`Invalid XP! Proper Usage: \`${guildPrefix}calc-xp <current level> <XP gained in that level>\``);

    const xp = parseInt(args[1]);

    if (xp > baseXP && level !== 1) return message.channel.send(`Invalid XP! Proper Usage: \`${guildPrefix}calc-xp <current level> <XP gained in that level>\``);

    const totalXP = baseXP + xp;

    const xpEmbed = new Discord.RichEmbed()
      .setAuthor("XP Calcuation", message.author.displayAvatarURL)
      .setColor(message.guild.me.displayHexColor)
      .setDescription(`You have **${numeral(totalXP).format("0,0")}** total XP! Would you like to set this as your current xp?`)
      .setTimestamp();

    const msg = await message.channel.send(xpEmbed);

    await msg.react("✅");
    await msg.react("❌");

    const filter = (reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id === message.author.id;
    const reactionCollector = msg.createReactionCollector(filter, {
      time: 30000
    });

    const reactionCollectorEnd = setTimeout(() => {
      msg.clearReactions().catch(e => bot.logger.log("error", e.stack));
      xpEmbed.setDescription(`You have **${numeral(totalXP).format("0,0")}** total XP!`);
      msg.edit(xpEmbed);
    }, 30000);

    reactionCollector.on("collect", async collected => {
      if (collected.emoji.name === "✅") {
        updateXp(message.author, totalXP);

        reactionCollector.stop();
        clearTimeout(reactionCollectorEnd);

        xpEmbed.setDescription(`You have **${numeral(totalXP).format("0,0")}** total XP!`);

        msg.edit(xpEmbed);
        msg.clearReactions().catch(e => bot.logger.log("error", e.stack));

        message.channel.send(`Got it! I have set your xp to **${numeral(totalXP).format("0,0")}**.`).then(m => m.delete(5000));

      } else if (collected.emoji.name === "❌") {
        clearTimeout(reactionCollectorEnd);

        msg.clearReactions().catch(e => bot.logger.log("error", e.stack));
        xpEmbed.setDescription(`You have **${numeral(totalXP).format("0,0")}** total XP!`);
        msg.edit(xpEmbed);

        reactionCollector.stop();
      }
    });

    async function updateXp(user, newXP) {
      bot.userInfo.update({
        xp: newXP,
        level: level
      }, {
        where: {
          user: user.id
        }
      });
    }
  },
};
