const Discord = require("discord.js");

module.exports = {
  name: "set-ign",
  description: "Set your in game name",
  aliases: ["setign"],
  async execute(message, args, bot) {
    args = message.content.split(/ +/);
    args.shift();

    if (!args[0] || args[0].length <= 0) return message.channel.send("Invalid IGN!");

    const swearWords = ["fuck", "fuk", "bitch", "b1tch", "btch", "cunt", "c0nt", "motherfucker", "dick", "pussy", "vagina"];
    if (swearWords.some(s => args.includes(s))) return message.channel.send("Inappropriate in game name, please use a different one!");

    const usersData = await bot.userInfo.get(bot, message.author, message.guild);
    usersData.ign = args.join(" ");

    await bot.userInfo.update({
      ign: usersData.ign
    }, {
      where: {
        user: message.author.id
      }
    });

    message.channel.send(`Got it! I have set your in game name to ${args.join(" ")}`);
  },
};
