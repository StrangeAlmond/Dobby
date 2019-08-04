const Discord = require("discord.js");

module.exports = {
  name: "help",
  description: "Display a list of commands",
  aliases: ["commands"],
  async execute(message, args, bot) {

    const guildData = await bot.guildInfo.get(bot, message.guild);

    const prefix = guildData.settings.prefix;
    const hasTrustedRole = guildData.settings["trusted-role"].length > 0 && message.member.roles.find(r => r.name.toLowerCase() === message.guild.roles.get(guildData.settings["trusted-role"]).name.toLowerCase());

    const wizardsUniteCommands = {
      "Profile": {
        "profile": `**${prefix}profile** - View your profile.`,
        "set-profession": `**${prefix}set-profession <profession>** - Set your profession.`,
        "calc-xp": `**${prefix}calc-xp <level> <xp gained in level>** - Calcuate your total XP.`,
        "set-level": `**${prefix}set-level <level>** - Set your level.`,
        "set-xp": `**${prefix}set-xp <xp>** - Set your XP.`,
        "set-ign": `**${prefix}set-ign <ign>** - Set your in game name.`,
        "set-title": `**${prefix}set-title <choice1>, [choice2], [choice3]**`,
        "set-house": `**${prefix}set-house <house>** - Set your house.`,
        "set-stats": `**${prefix}set-stats** - Set your statistics.`,
        "set-code": `**${prefix}set-code <friend code>** - Set your friend code.`,
        "reset": `**${prefix}reset <level/xp/house/title/ign/friend-code/stats>** - Reset the specified value.`,
      },

      "Friends": {
        "friend-codes": `**${prefix}friend-codes** - Display a list of friend codes for your server.`,
        "get-code": `**${prefix}get-code <@member>** - Search for a user's friend code.`
      },

      "Badges": {
        "badge": `**${prefix}badge list** - View ${message.guild.name}'s Available Badges.`
      },

      "Reports": {
        "leaderboard": `**${prefix}leaderboard [emergency/severe/high/medium/low/level/xp/stats]** - View the reporting leaderboard.`,
        "list": `**${prefix}list [emergency/severe/high/medium/low]** - List the reported foundables in this server.`,
        "report": `**${prefix}report <emergency/severe/high/medium/low/dark-detector> <details>** - Report a foundable.`,
        "subscribe": `**${prefix}subscribe <emergency/severe/high/medium/low/dark-detector>** - Subscribe to notifications.`,
        "unsubscribe": `**${prefix}unsubscribe <emergency/severe/high/medium/low>** - Unsubscribe from notifications.`,
        "subscriptions": `**${prefix}subscriptions** - View your subscriptions.`
      },

      "Servers": {
        "servers": `**${prefix}servers [page]** - Get the server list for that page.`
      },

      "Points of Interest": {
        "poi": `**${prefix}poi search <name>** - Search for a POI.\n**${prefix}poi list** - View a list of this servers POI.${hasTrustedRole ? `\n**${prefix}poi create <fortress/greenhouse/inn> <"name"> <coordinates>** Create a POI.` : ""}`
      },

      "Wizards Unite": {
        "resources": `**${prefix}resources** - View a list of resources for WU.`,
        "recipe": `**${prefix}recipe <potion name>** - View the recipe for a potion.`,
        "planted": `**${prefix}planted <greenhouse> <ingredient> <time remaining: hours:minutes (eg 3:25, 1:30, 24:00)>** - Report an ingredient growing in a greenhouse.`,
        "planted-list": `**${prefix}planted-list [search query]** - List all the planted ingredients in this server.`
      }
    };

    const wizardsUniteArray = Object.keys(wizardsUniteCommands);
    let wizardsUniteCommandsMessage = "";

    wizardsUniteArray.forEach(category => {
      const commands = Object.keys(wizardsUniteCommands[category]);
      wizardsUniteCommandsMessage += `**__${category}__**\n${commands.filter(c => !guildData.disabledCommands.includes(c)).map(c => wizardsUniteCommands[category][c]).join("\n")}\n\n`;
    });

    const botCommands = {
      "about": `**${prefix}about** - Shows info about Dobby.`,
      "ping": `**${prefix}ping** - Ping the bot.`,
      "uptime": `**${prefix}uptime** - View Dobby 's uptime.`
    };

    const botCommandsArray = Object.keys(botCommands).filter(c => !guildData.disabledCommands.includes(c));
    const botCommandsMessage = botCommandsArray.map(c => botCommands[c]).join("\n");

    const modCommands = {
      "Badges": {
        "badge": `**${prefix}badge list all** - List all badges, even hidden ones.\n**${prefix}badge add <badge id> <@member>** - Give a member a badge.\n**${prefix}badge remove <badge id> <@member>** - Remove a member's badge.`,
      },

      "Content Management": {
        "delete-report": `**${prefix}delete-report <report id>** - Delete a report.`,
      }
    };

    const modCommandsArray = Object.keys(modCommands).filter(c => !guildData.disabledCommands.includes(c));
    let modCommandsMessage = "";

    modCommandsArray.forEach(category => {
      const commands = Object.keys(modCommands[category]);
      modCommandsMessage += `**__${category}__**\n${commands.filter(c => !guildData.disabledCommands.includes(c)).map(c => modCommands[category][c]).join("\n")}\n\n`;
    });

    const adminCommands = {
      "Server Configuration": {
        "settings": `**${prefix}settings** - View your server's settings.`,
        "set-prefix": `**${prefix}set-prefix <prefix>** - Set your server's prefix.`,
        "set-trusted-role": `**${prefix}set-trusted-role <role name>** - Set your server's trusted role, this role is permitted to add POI.`,
        "disable-command": `**${prefix}disable-command <command>** - Disable a command, this will prevent users from using a command that was previously enabled.`,
        "enable-command": `**${prefix}enable-command <command>** - Enable a command, this will allow users to use a command that was previously disabled.`,
        "toggle": `**${prefix}toggle profession-roles** - Toggle whether or not a role is created when a user sets their profession.\n**${prefix}toggle listed** - Toggle whether or not your server is listed in ${bot.user.username}'s server list.`,
        "configure": `**${prefix}configure welcome message** - Configure your server's welcome message.`
      },

      "Badges": {
        "badge": `**${prefix}badge create <:emoji:> <"title"> <"description">** - Create a badge for your server.\n**${prefix}badge delete <badge id>** - Delete a badge from your server.\n**${prefix}badge edit <badge id> <:emoji:> <"name"> <"description">** - Edit a badge's details.\n**${prefix}badge hide <badge id>** - Hide a badge from **!badge list**, it will still function like normal.\n**${prefix}badge unhide <badge id>** - Unhide a badge.`,
      },

      "Points of Interest": {
        "poi": `**${prefix}poi create <fortress/greenhouse/inn> <"name"> <coordinates>** - Add a POI to your servers POI list.\n**${prefix}poi delete <id>** - Remove a POI from your servers POI list.\n**${prefix}poi edit <id> <fortress/inn/greenhouse> <"name"> <coordinates>** - Edit an existing POI's values.\n**${prefix}poi add-alias <id> <"alias name">** - Add an alias to a POI.\n**${prefix}poi delete-alias <id> <"alias name">** - Remove an alias from a POI.`,
        "export-poi": `**${prefix}export-poi** - Export your server's POI to a .csv file.`,
        "import-poi": `**${prefix}import-poi** - Import POI from an attached .csv file.`
      },

      "Content Management": {
        "reset": `**${prefix}reset [leaderboard/emergency/severe/high/medium/low/settings/location/prefix/toggles]** - Reset content in your server.`
      }
    };

    const adminCommandsArray = Object.keys(adminCommands).filter(c => !guildData.disabledCommands.includes(c));
    let adminCommandsMessage = "";

    adminCommandsArray.forEach(category => {
      const commands = Object.keys(adminCommands[category]);
      adminCommandsMessage += `**__${category}__**\n${commands.filter(c => !guildData.disabledCommands.includes(c)).map(c => adminCommands[category][c]).join("\n")}\n\n`;
    });

    const directions = "**__Arguments within < > are required.\nArguments within [] are optional.__**";

    const wizardsUniteEmbed = new Discord.RichEmbed()
      .setAuthor("Wizards Unite Commands", message.author.displayAvatarURL)
      .setDescription(`${directions}\n\n${wizardsUniteCommandsMessage}`)
      .setColor(message.guild.me.displayHexColor)
      .setTimestamp();

    const botCommandsEmbed = new Discord.RichEmbed()
      .setAuthor("Bot Commands", message.author.displayAvatarURL)
      .setDescription(`${directions}\n\n${botCommandsMessage}`)
      .setColor(message.guild.me.displayHexColor)
      .setTimestamp();

    const modCommandsEmbed = new Discord.RichEmbed()
      .setAuthor("Mod Commands", message.author.displayAvatarURL)
      .setDescription(`**All Mod commands require the Manage Messages permission**\n\n${directions}\n\n${modCommandsMessage}`)
      .setColor(message.guild.me.displayHexColor)
      .setTimestamp();

    const adminCommandsEmbed = new Discord.RichEmbed()
      .setAuthor("Admin Commands", message.author.displayAvatarURL)
      .setDescription(`**All Admin Commands require the Manage Server permission**\n\n${directions}\n\n${adminCommandsMessage}`)
      .setColor(message.guild.me.displayHexColor)
      .setTimestamp();

    const embeds = [];
    if (wizardsUniteCommandsMessage.length > 0) embeds.push(wizardsUniteEmbed);
    if (botCommandsMessage.length > 0) embeds.push(botCommandsEmbed);
    if (modCommandsMessage.length > 0) embeds.push(modCommandsEmbed);
    if (adminCommandsMessage.length > 0) embeds.push(adminCommandsEmbed);

    let page = 1;

    message.channel.send(wizardsUniteEmbed).then(async msg => {
      await msg.react("◀");
      await msg.react("▶");
      await msg.react("❌");

      const reactionFilter = (reaction, user) => (reaction.emoji.name === "◀" || reaction.emoji.name === "▶" || reaction.emoji.name === "❌") && user.id === message.author.id;
      const reactionCollector = msg.createReactionCollector(reactionFilter, {
        time: 120000
      });

      const endEmbed = setTimeout(() => {

        msg.clearReactions();
        embeds[page - 1].setFooter("The reaction menu has expired.");
        msg.edit(embeds[page - 1]);

      }, 120000);

      reactionCollector.on("collect", async collected => {
        if (collected.emoji.name === "◀") {
          if (page === 1) return msg.reactions.find(r => r.emoji.name === "◀").remove(message.author);
          page--;

          await msg.edit(embeds[page - 1]);

          msg.reactions.find(r => r.emoji.name === "◀").remove(message.author);
        } else if (collected.emoji.name === "▶") {
          if (page === embeds.length) return msg.reactions.find(r => r.emoji.name === "▶").remove(message.author);
          page++;

          await msg.edit(embeds[page - 1]);
          msg.reactions.find(r => r.emoji.name === "▶").remove(message.author);
        } else if (collected.emoji.name === "❌") {
          reactionCollector.stop();

          if (message.deletable) {
            message.delete();
          } else {
            message.react("✅");
          }

          msg.delete();
          clearTimeout(endEmbed);
        }
      });
    });
  },
};
