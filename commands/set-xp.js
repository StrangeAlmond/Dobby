const Discord = require("discord.js");
const numeral = require("numeral");

module.exports = {
  name: "set-xp",
  description: "Set your XP.",
  aliases: ["setxp"],
  async execute(message, args, bot) {
    if (!args[0]) return message.channel.send("Specify your XP!");
    let xp = numeral(args[0])._value;
    xp = Math.floor(xp);

    if (xp === null) return message.channel.send("Invalid XP!");
    if (xp < 0) return message.channel.send("You can't have negative XP!");

    let level = 1;
    let levelChanged = false;

    const levels = [0, 1000, 2500, 4500, 7500, 11500, 17500, 24500, 32500, 42500, 53500, 65000, 78500, 92500, 107500, 123500, 141500, 161500, 183500, 208500, 238500, 273500, 313500, 358500, 408500, 468500, 538500, 618500, 708500, 808500, 928500, 1068500, 1228500, 1408500, 1608500, 1828500, 2068500, 2328500, 2608500, 2908500, 3228500, 3568500, 3928500, 4308500, 4708500, 5158500, 5658500, 6208500, 6808500, 7508500, 8258500, 9058500, 9908500, 10808500, 11758500, 12758500, 13808500, 14908500, 16108500, 17608500];

    while ((xp - levels[level]) >= 0) {
      level++;
    }

    const usersData = await bot.userInfo.get(bot, message.author, message.guild);
    if (usersData.xp !== xp) usersData.xp = xp;

    if (usersData.level !== level) {
      usersData.level = level;
      if (!levelChanged) levelChanged = true;
    }

    await bot.userInfo.update({
      xp: usersData.xp,
      level: usersData.level
    }, {
      where: {
        user: message.author.id
      }
    });

    message.channel.send(`Got it! I have set your XP to **${numeral(xp).format("0,0")}** ${levelChanged ? `and your level to **${level}**` : ""}`);
  },
};
