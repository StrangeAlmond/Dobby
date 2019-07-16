const Discord = require("discord.js");

module.exports = {
  name: "reset",
  description: "Reset a value",
  async execute(message, args, bot) {
    const threatLevels = ["emergency", "severe", "high", "medium", "low"];
    if (!args[0]) return message.channel.send("Specify what you'd like to reset!");

    const guild = await bot.guildInfo.get(bot, message.guild);

    if (args[0] === "board" || args[0] === "leaderboard" || args[0] === "reports") {
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");

      message.channel.send("Are you sure you want to reset your guilds leaderboard?").then(async msg => {
        await msg.react("❌");
        await msg.react("✅");

        const confirmationFilter = (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id;
        const confirmationReactionCollector = msg.createReactionCollector(confirmationFilter, {
          time: 30000
        });

        confirmationReactionCollector.on("collect", async collected => {
          if (collected.emoji.name === "❌") {
            msg.delete();
            message.delete();
          } else {
            msg.delete();
            message.channel.send("Your guilds leaderboard has been reset!");

            const users = await bot.userInfo.findAll({
              where: {
                guild: message.guild.id
              }
            });

            guild.reports = [];
            bot.guildInfo.set(bot, {
              reports: guild.reports
            }, message.guild);

            users.forEach(user => {
              user.reports = [];

              bot.userInfo.set(bot, {
                reports: user.reports
              }, bot.users.get(user.user), message.guild);
            });
          }
        });

      });
    } else if (threatLevels.some(i => i.includes(args[0]))) {
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");

      const item = threatLevels.find(i => i.includes(args[0]));

      message.channel.send(`Are you sure you want to reset your guild's **${item}** reports?`).then(async msg => {
        await msg.react("❌");
        await msg.react("✅");

        const confirmationFilter = (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id;
        const confirmationReactionCollector = msg.createReactionCollector(confirmationFilter, {
          time: 30000
        });

        confirmationReactionCollector.on("collect", async collected => {
          if (collected.emoji.name === "❌") {
            msg.delete();
            message.delete();
          } else {
            msg.delete();
            message.channel.send(`Your guilds ${item} reports have been reset!`);

            const guildUsers = await bot.userInfo.findAll({
              where: {
                guild: message.guild.id
              }
            });

            guildUsers.forEach(user => {
              user.reports = user.reports.filter(r => r.threatLevel.toLowerCase() !== item.toLowerCase());
              bot.userInfo.set(bot, {
                reports: user.reports
              }, bot.users.get(user.user), message.guild);
            });

            const newReports = guild.reports.filter(r => r.threatLevel.toLowerCase() !== item.toLowerCase());
            guild.reports = newReports;
            bot.guildInfo.set(bot, {
              reports: guild.reports
            }, message.guild);
          }
        });

      });
    } else if (args[0] === "settings") {
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");

      const hasManageRoles = guild.me.hasPermission("MANAGE_ROLES");

      guild.settings = {
        "profession-roles": hasManageRoles,
        "house-roles": hasManageRoles,
        "listed": false,
        "trusted-role": "",
        "prefix": "!"
      };

      guild.location = {
        "coordinates": "",
        "location": ""
      };

      await bot.guildInfo.set(bot, {
        settings: guild.settings,
        location: guild.location
      }, message.guild);

      message.channel.send("Your server's settings have been reset.");
    } else if (args[0] === "trusted-role" && !guild.disabledCommands.includes("set-trusted-role")) {
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");
      guild.settings["trusted-role"] = "";
      await bot.guildInfo.set(bot, {
        settings: guild.settings
      }, message.guild);

      message.channel.send("Your server's trusted role has been reset.");
    } else if (args[0] === "toggles") {
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");

      const hasManageRoles = guild.me.hasPermission("MANAGE_ROLES");
      guild.settings["profession-roles"] = hasManageRoles;
      guild.settings["house-roles"] = hasManageRoles;
      guild.settings.listed = false;

      await bot.guildInfo.set(bot, {
        settings: guild.settings
      }, message.guild);

      message.channel.send("Your server's toggles have been reset");
    } else if (args[0] === "prefix") {
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");
      guild.settings.prefix = "!";

      await bot.guildInfo.set(bot, {
        settings: guild.settings
      }, message.guild);

      message.channel.send("Your server's prefix has been reset!");
    } else if (args[0] === "location" && !guild.disabledCommands.includes("set-location")) {
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");
      guild.location = {
        coordinates: "",
        location: ""
      };

      await bot.guildInfo.set(bot, {
        location: guild.location
      }, message.guild);

      message.channel.send("Your server's location has been reset");
    } else if (args[0] === "ign" && !guild.disabledCommands.includes("set-ign")) {
      const userData = await bot.userInfo.get(bot, message.author, message.guild);

      userData.ign = "";
      bot.userInfo.set(bot, {
        reports: userData.reports
      }, message.author, message.guild);

      message.channel.send("Got it! I have reset your IGN.");
    } else if (args[0] === "level" && !guild.disabledCommands.includes("set-level")) {
      const userData = await bot.userInfo.get(bot, message.author, message.guild);

      userData.level = 1;
      userData.xp = 1;
      bot.userInfo.set(bot, {
        reports: userData.reports
      }, message.author, message.guild);

      message.channel.send("Got it! I have reset your level.");
    } else if (args[0] === "xp" && !guild.disabledCommands.includes("set-xp")) {
      const userData = await bot.userInfo.get(bot, message.author, message.guild);

      userData.xp = 0;
      bot.userInfo.set(bot, {
        reports: userData.reports
      }, message.author, message.guild);

      message.channel.send("Got it! I have reset your house.");
    } else if (args[0] === "house" && !guild.disabledCommands.includes("set-house")) {
      const userData = await bot.userInfo.get(bot, message.author, message.guild);

      userData.house = "";
      bot.userInfo.set(bot, {
        reports: userData.reports
      }, message.author, message.guild);

      message.channel.send("Got it! I have reset your house.");
    } else if (args[0] === "title" && !guild.disabledCommands.includes("set-title")) {
      const userData = await bot.userInfo.get(bot, message.author, message.guild);

      userData.title = "";
      bot.userInfo.set(bot, {
        reports: userData.reports
      }, message.author, message.guild);

      message.channel.send("Got it! I have reset your title.");
    } else if (args[0] === "friend-code" && !guild.disabledCommands.includes("set-code")) {
      const userData = await bot.userInfo.get(bot, message.author, message.guild);

      userData.friendCode = "";
      bot.userInfo.set(bot, {
        friendCode: userData.friendCode
      }, message.author, message.guild);

      message.channel.send("Got it! I have reset your friend code.");
    } else if (args[0] === "stats" && !guild.disabledCommands.includes("set-stats")) {
      const userData = await bot.userInfo.get(bot, message.author, message.guild);

      userData.stats = {
        foundablesReturned: 0,
        distanceWalked: 0,
        poiVisited: 0,
        challengesWon: 0
      };

      bot.userInfo.set(bot, {
        stats: userData.stats
      }, message.author, message.guild);

      message.channel.send("Got it! I have reset your stats.");
    }
  },
};
