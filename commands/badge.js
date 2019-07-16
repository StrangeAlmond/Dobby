const Discord = require("discord.js");

module.exports = {
  name: "badge",
  description: "The main badge command",
  aliases: ["badges"],
  async execute(message, args, bot) {
    const guild = await bot.guildInfo.get(bot, message.guild);

    if (args[0] === "list") { // list all badges
      let badges = guild.badges.filter(b => !b.hidden);
      if ((args[1] === "all") && message.member.hasPermission("MANAGE_MESSAGES")) badges = guild.badges;

      if (badges.length <= 0) return message.channel.send("This server doesn't have any badges created.");

      const badgesEmbed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}'s Badges`, message.guild.iconURL)
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      for (let i = 0; i < badges.length; i++) {
        const badge = badges[i];
        badgesEmbed.addField(`${message.guild.emojis.get(badge.emoji) || badge.emoji} - ${badge.name} (#${badge.badgeID})`, badge.description);
      }

      message.channel.send(badgesEmbed);
    } else if (args[0] === "create") { // Create a badge
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");
      if (!args[1]) return message.channel.send(`Proper Usage: \`${guild.settings.prefix}badge create :emoji: "name" "description"\``);

      let emoji = args[1];

      if (emoji.length > 2) emoji = message.guild.emojis.find(e => emoji.includes(e.id)).id;
      if (!emoji) return message.channel.send(`Invalid Emoji. Proper Usage: \`${guild.settings.prefix}badge create :emoji: "name" "description"\``);

      args = message.content.split(/ +/).slice(2).join(" ").split(/"([^"]+)"/);
      if (!args[1]) return message.channel.send(`Proper Usage: \`${guild.settings.prefix}badge create :emoji: "name" "description"\``);
      if (!args[3]) return message.channel.send(`Proper Usage: \`${guild.settings.prefix}badge create :emoji: "name" "description"\``);

      const name = args[1];
      const description = args[3];

      const badgeObject = {
        emoji: emoji,
        name: name,
        description: description,
        hidden: false,
        badgeID: guild.badges.length + 1
      };

      guild.badges.push(badgeObject);
      bot.guildInfo.set(bot, {
        badges: guild.badges
      }, message.guild);

      const successEmbed = new Discord.RichEmbed()
        .setAuthor("Badge Added!", message.author.displayAvatarURL)
        .setColor("#4BB543")
        .setDescription(`${message.guild.emojis.get(emoji) || emoji} ${name} was added to your server!`)
        .setTimestamp();
      message.channel.send(successEmbed);
    } else if (args[0] === "delete") { // Delete a badge
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");
      if (!args[1]) return message.channel.send(`Proper Usage: \`${guild.settings.prefix}badge delete <badge id>\``);

      const badge = guild.badges.find(b => b.badgeID === parseInt(args[1]));
      if (!badge) return message.channel.send(`Invalid Badge. Proper Usage: \`${guild.settings.prefix}badge delete <badge id>\``);

      for (let i = guild.badges.findIndex(b => b.badgeID === badge.badgeID) + 1; i < guild.badges.length; i++) {
        guild.badges[i].id--;
      }

      guild.badges.splice(guild.badges.indexOf(badge), 1);
      bot.guildInfo.set(bot, {
        badges: guild.badges
      }, message.guild);

      let usersWithBadge = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      usersWithBadge = usersWithBadge.filter(u => u.badges.some(b => b.badgeID === badge.badgeID));

      usersWithBadge.filter(u => u.badges.find(b => b.badgeID === badge.badgeID)).forEach(user => {
        user.badges.splice(user.badges.indexOf(badge), 1);
        bot.userInfo.set(bot, {
          badges: user.badges
        }, bot.users.get(user.user), message.guild);
      });

      const successEmbed = new Discord.RichEmbed()
        .setAuthor("Badge Removed!", message.author.displayAvatarURL)
        .setColor("#4BB543")
        .setDescription(`${message.guild.emojis.get(badge.emoji) || badge.emoji} ${badge.name} was deleted from your server!`)
        .setTimestamp();
      message.channel.send(successEmbed);
    } else if (args[0] === "edit") { // Edit a badge
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");
      if (!args[1]) return message.channel.send(`Proper Usage: \`${guild.settings.prefix}badge edit <badge id> :emoji: "name" "description"\``);

      const badge = guild.badges.find(b => b.badgeID === parseInt(args[1]));
      if (!badge) return message.channel.send(`Invalid Badge. Proper Usage: \`${guild.settings.prefix}badge edit <badge id> :emoji: "name" "description"\``);
      let emoji = args[2];

      if (emoji.length > 2) emoji = message.guild.emojis.find(e => emoji.includes(e.id)).id;
      if (!emoji) return message.channel.send(`Invalid Emoji. Proper Usage: \`${guild.settings.prefix}badge edit <badge id> :emoji: "name" "description"\``);

      args = message.content.split(/ +/).slice(3).join(" ").split(/"([^"]+)"/);

      if (!args[1]) return message.channel.send(`Proper Usage: \`${guild.settings.prefix}badge edit <badge id> :emoji: "name" "description"\``);
      if (!args[3]) return message.channel.send(`Proper Usage: \`${guild.settings.prefix}badge edit <badge id> :emoji: "name" "description"\``);

      const name = args[1];
      const description = args[3];
      const index = guild.badges.findIndex(b => b.badgeID === badge.badgeID);

      badge.emoji = emoji;
      badge.name = name;
      badge.description = description;

      guild.badges.splice(index, 1, badge);
      bot.guildInfo.set(bot, {
        badges: guild.badges
      }, message.guild);

      let usersWithBadge = await bot.userInfo.findAll({
        where: {
          guild: message.guild.id
        }
      });

      usersWithBadge = usersWithBadge.filter(u => u.badges.some(b => b.badgeID === badge.badgeID));

      usersWithBadge.forEach(u => {
        u.badges.splice(guild.badges.findIndex(b => b.badgeID === badge.badgeID), 1, badge);
        bot.userInfo.set(bot, {
          badges: u.badges
        }, bot.users.get(u.user), message.guild);
      });

      const successEmbed = new Discord.RichEmbed()
        .setAuthor("Badge Edited!", message.author.displayAvatarURL)
        .setColor("#4BB543")
        .setDescription(`${message.guild.emojis.get(emoji) || emoji} ${name} was edited!`)
        .setTimestamp();
      message.channel.send(successEmbed);
    } else if (args[0] === "hide") { // Hide a badge
      if (!args[1]) return message.channel.send(`Proper Usage: \`${guild.settings.prefix}badge hide <badge id>\``);
      const badge = guild.badges.find(b => b.badgeID === parseInt(args[1]));
      if (!badge) return message.channel.send(`Invalid Badge. Proper Usage: \`${guild.settings.prefix}badge hide <badge id>\``);

      badge.hidden = true;
      guild.badges.splice(guild.badges.findIndex(b => b.badgeID === badge.badgeID), 1, badge);

      bot.guildInfo.set(bot, {
        badges: guild.badges
      }, message.guild);

      const successEmbed = new Discord.RichEmbed()
        .setAuthor("Badge Hidden!", message.author.displayAvatarURL)
        .setColor("#4BB543")
        .setDescription(`${message.guild.emojis.get(badge.emoji) || badge.emoji} ${badge.name} was hidden!`)
        .setTimestamp();
      message.channel.send(successEmbed);
    } else if (args[0] === "unhide") { // Unhide a badge
      if (!args[1]) return message.channel.send(`Proper Usage: \`${guild.settings.prefix}badge hide <badge id>\``);
      const badge = guild.badges.find(b => b.badgeID === parseInt(args[1]));
      if (!badge) return message.channel.send(`Invalid Badge. Proper Usage: \`${guild.settings.prefix}badge hide <badge id>\``);

      if (!badge.hidden) return message.channel.send("That badge isn't hidden!");

      badge.hidden = false;
      guild.badges.splice(guild.badges.findIndex(b => b.badgeID === badge.badgeID), 1, badge);

      bot.guildInfo.set(bot, {
        badges: guild.badges
      }, message.guild);

      const successEmbed = new Discord.RichEmbed()
        .setAuthor("Badge No longer hidden!", message.author.displayAvatarURL)
        .setColor("#4BB543")
        .setDescription(`${message.guild.emojis.get(badge.emoji) || badge.emoji} ${badge.name} is no longer hidden!`)
        .setTimestamp();
      message.channel.send(successEmbed);
    } else if (args[0] === "grant" || args[0] === "add" || args[0] === "give") { // Give someone a badge
      if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have the required permissions for this command!");
      const badge = guild.badges.find(b => b.badgeID === parseInt(args[1]));

      if (!badge) return message.channel.send(`Invalid Badge. Proper Usage: \`${guild.settings.prefix}badge add <badge id> <@member>\``);
      if (!message.mentions.members.first()) return message.channel.send(`I couldn't find that member. Proper Usage: \`${guild.settings.prefix}badge add <badge id> <@member>\``);

      const users = message.mentions.members;
      users.forEach(async user => {
        if (user.bot) return;
        await bot.userInfo.ensure(bot, user, message.guild);

        const userData = await bot.userInfo.get(bot, user, message.guild);

        const failEmbed = new Discord.RichEmbed()
          .setAuthor(`Could not give ${user.displayName} the ${badge.title} badge.`, user.user.displayAvatarURL)
          .setDescription("User already has that badge")
          .setColor("#cc0000")
          .setTimestamp();

        const successEmbed = new Discord.RichEmbed()
          .setAuthor("Badge Granted", user.user.displayAvatarURL)
          .setDescription(`${user.displayName} has been given the ${message.guild.emojis.get(badge.emoji) || badge.emoji} ${badge.name} badge.`)
          .setColor(user.displayHexColor)
          .setTimestamp();

        if (userData.badges.find(b => b.badgeID === badge.badgeID)) return message.channel.send(failEmbed);

        userData.badges.push(badge);
        await bot.userInfo.set(bot, {
          badges: userData.badges
        }, user, message.guild);

        message.channel.send(successEmbed);
      });

    } else if (args[0] === "revoke" || args[0] === "remove") { // Take away someones badge
      if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have the required permissions for this command!");
      const badge = guild.badges.find(b => b.badgeID === parseInt(args[1]));

      if (!badge) return message.channel.send(`Invalid Badge. Proper Usage: \`${guild.settings.prefix}badge revoke <badge id> <@member>\``);
      if (!message.mentions.members.first()) return message.channel.send(`I couldn't find that member. Proper Usage: \`${guild.settings.prefix}badge revoke <badge id> <@member>\``);

      const users = message.mentions.members;
      users.forEach(async user => {
        if (user.bot) return;
        await bot.userInfo.ensure(bot, user, message.guild);

        const userData = bot.userInfo.get(bot, user, message.guild);

        const failEmbed = new Discord.RichEmbed()
          .setAuthor(`Could not remove ${user.displayName}'s ${badge.title} badge.`, user.user.displayAvatarURL)
          .setDescription("User doesn't have that badge")
          .setColor("#cc0000")
          .setTimestamp();

        const successEmbed = new Discord.RichEmbed()
          .setAuthor("Badge Removed", user.user.displayAvatarURL)
          .setDescription(`${user.displayName}'s ${message.guild.emojis.get(badge.emoji) || badge.emoji} ${badge.name} badge has been removed.`)
          .setColor(user.displayHexColor)
          .setTimestamp();

        if (!userData.badges.find(b => b.badgeID === badge.badgeID)) return message.channel.send(failEmbed);

        userData.badges.splice(userData.badges.indexOf(badge), 1);
        await bot.userInfo.set(bot, {
          badges: userData.badges
        }, user, message.guild);

        message.channel.send(successEmbed);
      });
    } else if (args[0] === "profile") { // View your badges
      const usersData = await bot.userInfo.get(bot, message.author, message.guild);

      let badgeMessage = "";

      for (let i = 0; i < usersData.badges.length; i++) {
        const badge = usersData.badges[i];
        if (!message.guild.emojis.get(badge.emoji) && badge.emoji.length > 2) return;
        badgeMessage += `${message.guild.emojis.get(badge.emoji) || badge.emoji} - **${badge.name}**`;
      }

      const profileEmbed = new Discord.RichEmbed()
        .setAuthor(`${message.member.displayName}'s Badges`, message.author.displayAvatarURL)
        .setDescription(badgeMessage.length > 0 ? badgeMessage : "N/A")
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();
      message.channel.send(profileEmbed);
    }
  },
};
