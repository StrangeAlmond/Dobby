const Discord = require("discord.js");

const numeral = require("numeral");

module.exports = {
  name: "profile",
  description: "View your profile",
  aliases: ["me", "p"],
  async execute(message, args, bot) {

    const member = message.mentions.members.first() || message.guild.members.get(args[0]) || message.member;
    const guildsData = await bot.guildInfo.get(bot, message.guild);

    if (member.user.bot) return message.channel.send("Bots don't have profiles!");

    await bot.userInfo.ensure(bot, member.user, message.guild);

    const userData = await bot.userInfo.get(bot, member.user, message.guild);

    const profileEmbed = new Discord.RichEmbed()
      .setAuthor(`${member.displayName}'s Profile`, member.user.displayAvatarURL)
      .setColor(message.guild.me.displayHexColor)
      .setTimestamp();

    if (!guildsData.disabledCommands.includes("report")) {
      profileEmbed.addField("Total Reports", userData.reports.length, true);
    }

    if (!guildsData.disabledCommands.includes("set-level")) {
      profileEmbed.addField("Level", userData.level === 0 ? `Use \`${guildsData.settings.prefix}set-level <level>\` to set your level.` : userData.level, true);
    }

    if (!guildsData.disabledCommands.includes("set-xp")) {
      profileEmbed.addField("XP", userData.xp === 0 ? `Use \`${guildsData.settings.prefix}set-xp <xp>\` to set your XP.` : numeral(userData.xp).format("0,0"), true);
    }

    if (!guildsData.disabledCommands.includes("set-house")) {
      profileEmbed.addField("House", userData.house.length <= 0 ? `Use \`${guildsData.settings.prefix}set-house <house>\` to set your House.` : userData.house.charAt(0).toUpperCase() + userData.house.slice(1), true);
    }

    if (!guildsData.disabledCommands.includes("set-profession") && userData.level > 5) {
      profileEmbed.addField("Profession", userData.profession.length <= 0 ? `None. (use \`${guildsData.settings.prefix}set-profession <profession>\` to assign yourself a profession.)` : userData.profession.charAt(0).toUpperCase() + userData.profession.slice(1), true);
    }

    if (!guildsData.disabledCommands.includes("set-ign")) {
      profileEmbed.addField("In Game Name", userData.ign.length <= 0 ? `Use \`${guildsData.settings.prefix}set-ign <name>\` To set your in game name.` : userData.ign, true);
    }

    if (!guildsData.disabledCommands.includes("set-code")) {
      profileEmbed.addField("Friend Code", userData.friendCode.length <= 0 ? `Use \`${guildsData.settings.prefix}set-code <friend code>\` to set your friend code.` : chunk(userData.friendCode, 4).join(" "), true);
    }

    if (!guildsData.disabledCommands.includes("set-title")) {
      profileEmbed.addField("Title", userData.title.length <= 0 ? `Use \`${guildsData.settings.prefix}set-title <choice1>, [choice2], [choice3]\` to set your title.` : userData.title, true);
    }

    if (!guildsData.disabledCommands.includes("set-stats")) {
      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      profileEmbed.addField("Statistics", Object.values(userData.stats).reduce(reducer) > 0 ? `**${userData.stats.foundablesReturned}** Foundables Returned.\n**${userData.stats.distanceWalked}** Kilometer${userData.stats.distanceWalked > 1 ? "s" : ""} Walked.\n**${userData.stats.poiVisited}** Inns and Greenhouses Visited.\n**${userData.stats.challengesWon}** Wizarding Challenges Won.` : `Use \`${guildsData.settings.prefix}set-stats\` to set your statistics.`, true);
    }

    if (!guildsData.disabledCommands.includes("badge")) {
      profileEmbed.addField("Badges", `${userData.badges.length > 0 ? userData.badges.map(b => `${message.guild.emojis.get(b.emoji) || b.emoji} - **${b.name}**`).join("\n") : "N/A"}`, true);
    }

    message.channel.send(profileEmbed);

    function chunk(str, n) {
      const ret = [];
      let i;
      let len;

      for (i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n));
      }

      return ret;
    }
  },
};
