const Discord = require("discord.js");
const botconfig = require("../botconfig.json");
const prefix = botconfig.prefix;
const moment = require("moment-timezone");
const userInfo = require("../utils/userInfo.js");
const guildInfo = require("../utils/guildInfo.js");

module.exports = async bot => {
  bot.user.setActivity("Just Started, Sorry for the downtime!");

  setTimeout(async () => {
    bot.user.setActivity(`!help | Version ${botconfig.version}`);
  }, 300000);

  bot.userInfo.sync();
  bot.guildInfo.sync();

  bot.userInfo.get = userInfo.get;
  bot.userInfo.ensure = userInfo.ensure;
  bot.userInfo.set = userInfo.set;
  bot.userInfo.delete = userInfo.delete;

  bot.guildInfo.get = guildInfo.get;
  bot.guildInfo.ensure = guildInfo.ensure;
  bot.guildInfo.set = guildInfo.set;
  bot.guildInfo.delete = guildInfo.delete;

  setInterval(async () => {
    let guilds = await bot.guildInfo.findAll();
    guilds = guilds.filter(u => u.planted.length > 0 || u.reports.length > 0);

    guilds.forEach(async guild => {

      [...guild.planted].filter(g => !g.archived).forEach(async greenhouse => {
        if (Date.now() < greenhouse.time) return;

        if ((Date.now() - greenhouse.time) >= 1800000) {
          greenhouse.archived = true;

          guild.planted.splice(guild.planted.findIndex(g => g.message === greenhouse.message), 1, greenhouse);

          await bot.guildInfo.set(bot, {
            planted: guild.planted
          }, bot.guilds.get(guild.guild));

          bot.logger.log("info", "Greenhouse archived.");

          return;
        }

        if (greenhouse.sprouted) return;

        if (!bot.guilds.find(g => g.channels.get(greenhouse.channel)).channels.get(greenhouse.channel)) {
          guild.planted.splice(guild.planted.indexOf(greenhouse), 1);

          await bot.guildInfo.set(bot, {
            planted: guild.planted
          }, bot.guilds.get(guild.guild));

          return;
        }

        const guildData = await bot.guildInfo.get(bot, bot.guilds.find(g => g.channels.get(greenhouse.channel)));

        let directions = [`https://www.google.com/maps/search/${greenhouse.greenhouse.split(/ +/g).join("+")}${guildData.location.location.length > 0 ? `+${guildData.location.location.split(/ +/g).join("+")}` : ""}`, `http://maps.apple.com/?q=SEARCH${greenhouse.greenhouse.split(/ +/g).join("+")}${guildData.location.location.length > 0 ? `+${guildData.location.location.split(/ +/g).join("+")}` : ""}`, `http://waze.to/?q=${greenhouse.greenhouse.split(/ +/g).join("+")}${guildData.location.location.length > 0 ? `+${guildData.location.location.split(/ +/g).join("+")}` : ""}`];
        if (guildData.poi.some(p => greenhouse.greenhouse.includes(p.name.toLowerCase()) || p.aliases.some(a => greenhouse.greenhouse.includes(a.toLowerCase())))) {
          const poi = guildData.poi.find(p => greenhouse.greenhouse.includes(p.name.toLowerCase()) || p.aliases.some(a => greenhouse.greenhouse.includes(a.toLowerCase())));
          if (greenhouse.unknownLocation) greenhouse.unknownLocation = false;
          directions = [`https://www.google.com/maps/place/${poi.latitude},${poi.longitude}`, `http://maps.apple.com/?daddr=${poi.latitude},${poi.longitude}`, `http://waze.to/?ll=${poi.latitude},${poi.longitude}`];
        }

        const seed = greenhouse.seed.split(/ +/g).map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(" ");
        const users = greenhouse.users.filter(u => bot.users.get(u)).map(u => bot.users.get(u)).join(", ");

        const plantedEmbed = new Discord.RichEmbed()
          .setAuthor(`A ${seed} seed has sprouted at ${greenhouse.greenhouse}!`)
          .addField("Directions", `[Google Maps](${directions[0]}), [Apple Maps](${directions[1]}), [Waze](${directions[2]})${greenhouse.unknownLocation ? " (Unknown location, these directions may be incorrect.)" : ""}`)
          .setColor(bot.guilds.find(g => g.channels.get(greenhouse.channel)).me.displayHexColor)
          .setTimestamp();

        await bot.guilds.find(g => g.channels.get(greenhouse.channel)).channels.get(greenhouse.channel).send(users, plantedEmbed);

        greenhouse.sprouted = true;

        guildData.planted.splice(guildData.planted.findIndex(g => g.message === greenhouse.message), 1, greenhouse);
        await bot.guildInfo.set(bot, {
          planted: guild.planted
        }, bot.guilds.get(guild.guild));

      });

      [...guild.reports].filter(r => !r.archived).forEach(async report => {
        if ((Date.now() - report.time) < 1800000) return;

        report.archived = true;
        guild.reports.splice(guild.reports.findIndex(r => r.message === report.message), 1, report);
        await bot.guildInfo.set(bot, {
          reports: guild.reports
        }, bot.guilds.get(guild.guild));

        bot.logger.log("info", "Report removed from DB.");

      });
    });
  }, 15000);

  console.log(`Bot is logged in!\nBot was ready at: ${moment().tz("America/Los_Angeles").format("LLLL")}\nUser: ${bot.user.username}\nGuilds: ${bot.guilds.size}\nMembers: ${bot.users.size}\nChannels: ${bot.channels.size}\nPrefix: ${prefix}\nCommands Loaded: ${bot.commands.size}\nBot is logged in!`);
};
