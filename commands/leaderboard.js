const Discord = require("discord.js");

const sm = require("string-similarity");
const numeral = require("numeral");

module.exports = {
  name: "leaderboard",
  description: "Display the reporting leaderboard",
  aliases: ["board"],
  async execute(message, args, bot) {
    const threatLevels = ["emergency", "severe", "high", "medium", "low"];

    function formatNumber(number) {
      return numeral(number).format("0,0");
    }

    if (!args[0] || args.join(" ") === "total reports") {
      let users = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      users = users.filter(u => u.reports.length > 0).sort((a, b) => b.reports.length - a.reports.length).splice(0, 10);

      const leaderboardEmbed = new Discord.RichEmbed()
        .setAuthor(`Total Reports Leaderboard for ${message.guild.name}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      users.forEach(user => {
        leaderboardEmbed.addField(message.guild.members.get(user.user).displayName, `${user.reports.length} Total Reports`);
      });

      message.channel.send(leaderboardEmbed);
    } else if (args[0] && args[0].includes("level")) {
      let users = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      users = users.filter(u => u.level > 0).sort((a, b) => b.level - a.level).splice(0, 10);

      const leaderboardEmbed = new Discord.RichEmbed()
        .setAuthor(`Level Leaderboard for ${message.guild.name}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      users.forEach(user => {
        leaderboardEmbed.addField(message.guild.members.get(user.user).displayName, `Level ${user.level}`);
      });

      message.channel.send(leaderboardEmbed);
    } else if (args[0] && args[0] === "xp") {
      let users = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      users = users.filter(u => u.xp > 0).sort((a, b) => b.xp - a.xp).splice(0, 10);

      const leaderboardEmbed = new Discord.RichEmbed()
        .setAuthor(`XP Leaderboard for ${message.guild.name}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      users.forEach(user => {
        leaderboardEmbed.addField(message.guild.members.get(user.user).displayName, `${formatNumber(user.xp)} XP`);
      });

      message.channel.send(leaderboardEmbed);
    } else if (args[0] === "foundables") {
      let users = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      users = users.filter(u => u.stats.foundablesReturned > 0).sort((a, b) => b.stats.foundablesReturned - a.stats.foundablesReturned).splice(0, 10);

      const leaderboardEmbed = new Discord.RichEmbed()
        .setAuthor(`Foundables Returned Leaderboard for ${message.guild.name}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      users.forEach(user => {
        leaderboardEmbed.addField(message.guild.members.get(user.user).displayName, `${formatNumber(user.stats.foundablesReturned)} Foundables Returned`);
      });

      message.channel.send(leaderboardEmbed);
    } else if (args[0] === "kilometers") {
      let users = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      users = users.filter(u => u.stats.distanceWalked > 0).sort((a, b) => b.stats.distanceWalked - a.stats.distanceWalked).splice(0, 10);

      const leaderboardEmbed = new Discord.RichEmbed()
        .setAuthor(`Kilometers Walked Leaderboard for ${message.guild.name}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      users.forEach(user => {
        leaderboardEmbed.addField(message.guild.members.get(user.user).displayName, `${formatNumber(user.stats.distanceWalked)} Kilometers Walked`);
      });

      message.channel.send(leaderboardEmbed);
    } else if (args[0] === "inns" || args[0] === "greenhouses") {
      let users = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      users = users.filter(u => u.stats.poiVisited > 0).sort((a, b) => b.stats.poiVisited - a.stats.poiVisited).splice(0, 10);

      const leaderboardEmbed = new Discord.RichEmbed()
        .setAuthor(`Inns and Greenhouses Visited Leaderboard for ${message.guild.name}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      users.forEach(user => {
        leaderboardEmbed.addField(message.guild.members.get(user.user).displayName, `${formatNumber(user.stats.poiVisited)} Inns and Greenhouses Visited`);
      });

      message.channel.send(leaderboardEmbed);
    } else if (args[0] === "wizarding" || args[0] === "challenges") {
      let users = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      users = users.filter(u => u.stats.challengesWon > 0).sort((a, b) => b.stats.challengesWon - a.stats.challengesWon).splice(0, 10);

      const leaderboardEmbed = new Discord.RichEmbed()
        .setAuthor(`Wizarding Challenges Won Leaderboard for ${message.guild.name}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      users.forEach(user => {
        leaderboardEmbed.addField(message.guild.members.get(user.user).displayName, `${formatNumber(user.stats.challengesWon)} Wizarding Challenges Won`);
      });

      message.channel.send(leaderboardEmbed);
    } else if (args[0] === "stats" || args[0] === "statistics") {
      let users = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      const reducer = (accumulator, currentValue) => accumulator + currentValue;

      users = users.filter(u => Object.values(u.stats).reduce(reducer) > 0).sort((a, b) => Object.values(b.stats).reduce(reducer) - Object.values(a.stats).reduce(reducer)).splice(0, 10);

      const leaderboardEmbed = new Discord.RichEmbed()
        .setAuthor(`Statistics Leaderboard for ${message.guild.name}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      users.forEach(user => {
        leaderboardEmbed.addField(message.guild.members.get(user.user).displayName, `${formatNumber(user.stats.foundablesReturned)} Foundables Returned | ${formatNumber(user.stats.distanceWalked)} KM Walked | ${formatNumber(user.stats.poiVisited)} Inns & Greenhouses Visited | ${formatNumber(user.stats.challengesWon)} Wizarding Challenges Won.`);
      });

      message.channel.send(leaderboardEmbed);
    } else {
      let type;

      if (args[0]) {
        type = sm.findBestMatch(args[0], threatLevels).bestMatch;
        if (type.rating < 0.2) return;
        type = type.target;
      }

      let leaderboardName = "";

      if (type === "emergency") {
        leaderboardName = "Emergency Threat Level Foundables Reported";
      } else if (type === "severe") {
        leaderboardName = "Severe Threat Level Foundables Reported";
      } else if (type === "high") {
        leaderboardName = "High Threat Level Foundables Reported";
      } else if (type === "medium") {
        leaderboardName = "Medium Threat Level Foundables Reported";
      } else if (type === "low") {
        leaderboardName = "Low Threat Level Foundables Reported";
      }

      let users = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      users = users.filter(u => u.reports.filter(r => r.type === type).length > 0).sort((a, b) => b.reports.filter(r => r.type === type).length - a.reports.filter(r => r.type === type).length).splice(0, 10);

      const leaderboardEmbed = new Discord.RichEmbed()
        .setAuthor(`${leaderboardName} Leaderboard for ${message.guild.name}`)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      users.forEach(user => {
        leaderboardEmbed.addField(message.guild.members.get(user.user).displayName, `${user.reports.filter(r => r.threatLevel === type).length} ${leaderboardName}`);
      });

      message.channel.send(leaderboardEmbed);
    }
  },
};
