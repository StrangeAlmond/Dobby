const Discord = require("discord.js");

module.exports = {
  name: "toggle",
  description: "Toggle a setting",
  async execute(message, args, bot) {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");
    const guild = await bot.guildInfo.get(bot, message.guild);

    if (args[0] === "profession-roles") {
      if (guild.settings["profession-roles"]) {
        guild.settings["profession-roles"] = false;
        message.channel.send("Profession roles will no longer be created when someone sets their profession.");
      } else {
        guild.settings["profession-roles"] = true;
        message.channel.send("Profession roles will now be created when a user sets their profession.");
      }

      bot.guildInfo.set(bot, {
        settings: guild.settings
      }, message.guild);
    } else if (args[0] === "house-roles") {
      if (guild.settings["house-roles"]) {
        guild.settings["house-roles"] = false;
        message.channel.send("House roles will no longer be created when someone sets their house.");
      } else {
        guild.settings["house-roles"] = true;
        message.channel.send("House roles will now be created when a user sets their house.");
      }

      bot.guildInfo.set(bot, {
        settings: guild.settings
      }, message.guild);
    } else if (args[0] === "listed") {
      if (guild.settings["listed"]) {
        guild.settings["listed"] = false;
        message.channel.send("Your server is no longer listed.");
      } else {
        if (!message.guild.me.hasPermission("MANAGE_GUILD")) return message.channel.send("I need the Manage Server permission to list your server!");
        guild.settings["listed"] = true;
        message.channel.send("Your server is now listed!");
      }

      bot.guildInfo.set(bot, {
        settings: guild.settings
      }, message.guild);
    }
  },
};
