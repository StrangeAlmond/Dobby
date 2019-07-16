const Discord = require("discord.js");

module.exports = {
  name: "set-code",
  description: "Set your friend code.",
  aliases: ["set-friend-code", "setcode", "setfriendcode"],
  async execute(message, args, bot) {
    if (!args[0]) return message.channel.send("Specify your friend code!");
    const code = args.join(" ").match(/[0-9]+[0-9]+[0-9]/gim);
    if (!code) return message.channel.send("Invalid friend code!");

    const userData = await bot.userInfo.get(bot, message.author, message.guild);
    userData.friendCode = code.join("");

    await bot.userInfo.update({
      friendCode: userData.friendCode
    }, {
      where: {
        user: message.author.id
      }
    });

    message.channel.send(`Got it! I have set your friend code to ${code.join(" ")}`);
  },
};
