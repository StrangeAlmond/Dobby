const Discord = require("discord.js");

module.exports = {
  name: "set-level",
  description: "Set your level",
  aliases: ["set-lvl", "setlevel", "setlvl"],
  async execute(message, args, bot) {
    if (!args[0]) return message.channel.send("Specify a level!");
    const level = parseInt(args[0]);

    if (level > 60) return message.channel.send("The maximum level available in Harry Potter: Wizards Unite is level 60.");

    const usersData = await bot.userInfo.get(bot, message.author, message.guild);

    if (usersData.level === level) return message.channel.send(`You are already level ${level}!`);

    const levels = [0, 1000, 2500, 4500, 7500, 11500, 17500, 24500, 32500, 42500, 53500, 65000, 78500, 92500, 107500, 123500, 141500, 161500, 183500, 208500, 238500, 273500, 313500, 358500, 408500, 468500, 538500, 618500, 708500, 808500, 928500, 1068500, 1228500, 1408500, 1608500, 1828500, 2068500, 2328500, 2608500, 2908500, 3228500, 3568500, 3928500, 4308500, 4708500, 5158500, 5658500, 6208500, 6808500, 7508500, 8258500, 9058500, 9908500, 10808500, 11758500, 12758500, 13808500, 14908500, 16108500, 17608500];

    usersData.level = level;
    usersData.xp = levels[level - 1];

    await bot.userInfo.update({
      level: usersData.level,
      xp: usersData.xp
    }, {
      where: {
        user: message.author.id
      }
    });

    message.channel.send(`Got it! I have updated your level to ${level}`);
  },
};
