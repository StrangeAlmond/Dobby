const Discord = require("discord.js");

module.exports = {
  name: "set-prefix",
  description: "Set your guild's prefix",
  aliases: ["setprefix"],
  async execute(message, args, bot) {
    if (!args[0]) return message.channel.send("Specify a new prefix!");

    const newPrefix = args[0].replace(/\s/g, "");

    const guildsData = await bot.guildInfo.get(bot, message.guild);

    guildsData.settings.prefix = newPrefix;
    bot.guildInfo.set(bot, {
      settings: guildsData.settings
    }, message.guild);

    message.channel.send(`Got it! I have set the prefix to \`${newPrefix}\`!`);
  },
};
