const Discord = require("discord.js");
const Coordinates = require("coordinate-parser");

module.exports = {
  name: "poi",
  description: "The general poi command",
  aliases: ["pois"],
  async execute(message, args, bot) {
    args = message.content.split(/ +/);
    args.shift();

    const guild = await bot.guildInfo.get(bot, message.guild);

    if (!args[0]) return message.channel.send(`Proper Usage:\n\`${guild.settings.prefix}poi create <fortress/inn/greenhouse> <"name"> <coordinates>\``);

    function isLocationValid(position) {
      try {
        new Coordinates(position);
        return true;
      } catch (e) {
        return false;
      }
    }

    if (args[0].toLowerCase() === "create") {
      const hasTrustedRole = guild.settings["trusted-role"].length > 0 && message.member.roles.find(r => r.name.toLowerCase() === message.guild.roles.get(guild.settings["trusted-role"]).name.toLowerCase());
      if (!message.member.hasPermission("MANAGE_GUILD") && !hasTrustedRole) return message.channel.send("You don't have the required permissions for this command!");
      const possiblePoi = ["fortress", "inn", "greenhouse"];

      if (!args[1]) return message.channel.send(`You must specify a type for your POI! Proper Usage: \`${guild.settings.prefix}poi create <fortress/inn/greenhouse> <"name"> <coordinates>\``);
      if (!possiblePoi.some(i => i.includes(args[1].toLowerCase()))) return message.channel.send("Invalid type, you can choose between `fortress`, `inn`, or `greenhouse`");

      const type = possiblePoi.find(i => i.includes(args[1].toLowerCase()));
      args = args.slice(2).join(" ").split(/"(.*?)"/).map(a => a.trim());

      if (!args[1]) return message.channel.send(`Invalid Name, Remember to wrap the POI name in quotes. Proper Usage: \`${guild.settings.prefix}poi create <fortress/inn/greenhouse> <"name"> <coordinates>\``);
      if (!args[2]) return message.channel.send(`Invalid Location. Proper Usage: \`${guild.settings.prefix}poi create <fortress/inn/greenhouse> <"name"> <coordinates>\``);

      const name = args[1];
      const location = args.slice(2).join(" ");

      if (!isLocationValid(location)) return message.channel.send(`Invalid Coordinates. Proper Usage: \`${guild.settings.prefix}poi create <fortress/inn/greenhouse> <"name"> <coordinates>\``);
      if (guild.poi.find(p => p.name.toLowerCase() === name.toLowerCase() && p.type === type)) return message.channel.send("You cannot have two of the same POI.");

      const coordinates = new Coordinates(location);

      const poiObject = {
        name: name,
        latitude: coordinates.getLatitude(),
        longitude: coordinates.getLongitude(),
        type: type,
        createdAt: message.createdTimestamp,
        createdBy: message.author.id,
        aliases: []
      };

      guild.poi.push(poiObject);
      bot.guildInfo.set(bot, {
        poi: guild.poi
      }, message.guild);

      message.channel.send(`I have successfully added a ${type} POI with the name **${name}**, Located at **${coordinates.latitude}, ${coordinates.longitude}** to your guilds POI list.`);
    } else if (args[0].toLowerCase() === "delete") {
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");
      if (!args[1]) return message.channel.send(`You must specify the ID of the POI you wish to remove! Proper Usage: \`${guild.settings.prefix}poi delete <ID>\``);
      if (isNaN(args[1])) return message.channel.send(`Invalid ID. Proper Usage: \`${guild.settings.prefix}poi delete <ID>\``);

      const id = parseInt(args[1]) - 1;

      if (!guild.poi[id]) return message.channel.send(`There is no POI with an ID of ${args[1]}! Proper Usage: \`${guild.settings.prefix}poi delete <ID>\``);
      const poi = guild.poi[id];

      guild.poi.splice(guild.poi.indexOf(poi), 1);
      bot.guildInfo.set(bot, {
        poi: guild.poi
      }, message.guild);

      message.channel.send(`I have successfully deleted the POI with an ID of ${args[1]}`);
    } else if (args[0].toLowerCase() === "edit") {
      if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");
      if (!args[1]) return message.channel.send(`You must specify the ID of the POI you wish to edit! Proper Usage: \`${guild.settings.prefix}poi edit <ID> <fortress/inn/greenhouse> <"name"> <coordinates>\``);
      if (isNaN(args[1])) return message.channel.send(`Invalid ID. Proper Usage: \`${guild.settings.prefix}poi edit <ID> <fortress/inn/greenhouse> <"name"> <coordinates>\``);

      const index = parseInt(args[1]) - 1;

      if (!guild.poi[index]) return message.channel.send(`There is no POI with an ID of ${index + 1}!\nProper Usage: \`${guild.settings.prefix}poi edit <ID> <fortress/inn/greenhouse> <"name"> <coordinates>\``);

      const possiblePoi = ["fortress", "inn", "greenhouse"];
      if (!args[2]) return message.channel.send(`You must specify the new POI type!\nProper Usage: \`${guild.settings.prefix}poi edit <ID> <fortress/inn/greenhouse> <"name"> <coordinates>\``);
      if (!possiblePoi.some(i => i.includes(args[2].toLowerCase()))) return message.channel.send("Invalid type, you can choose between `fortress`, `inn`, or `greenhouse`");

      const type = args[2];

      args = args.slice(3).join(" ").split(/"(.*?)"/).map(a => a.trim());
      if (!args[1]) return message.channel.send(`You must specify the new name for your POI!\nProper Usage: \`${guild.settings.prefix}poi create <fortress/inn/greenhouse> <"name"> <coordinates>\``);
      if (!args[2]) return message.channel.send(`You must specify the new coordinates for your POI!\nProper Usage: \`${guild.settings.prefix}poi edit <ID> <fortress/inn/greenhouse> <"name"> <coordinates>\``);

      const name = args[1];
      const location = args.slice(2).join(" ");

      if (!isLocationValid(location)) return message.channel.send(`Invalid Coordinates. Proper Usage: \`${guild.settings.prefix}poi create <fortress/inn/greenhouse> <"name"> <coordinates>\``);
      const coordinates = new Coordinates(location);

      const poi = guild.poi[index];
      poi.name = name;
      poi.latitude = coordinates.latitude;
      poi.longitude = coordinates.longitude;
      poi.type = type;
      poi.editedAt = message.createdTimestamp;
      poi.editedBy = message.author.id;

      guild.poi.splice(index, 1, poi);
      bot.guildInfo.set(bot, {
        poi: guild.poi
      }, message.guild);

      message.channel.send(`You have edited the POI with an id of **${index + 1}** to have a new name of **${poi.name}**, a **${poi.type}** type, and a location of **${poi.latitude} ${poi.longitude}**.`);
    } else if (args[0].toLowerCase() === "add-alias") {
      if (!args[1]) return message.channel.send(`You must specify the ID of the poi you wish to give an alias! Proper Usage: \`${guild.settings.prefix}poi add-alias <ID> <"name">\``);
      if (isNaN(args[1])) return message.channel.send(`Invalid ID. Proper Usage: \`${guild.settings.prefix}poi add-alias <ID> <"name">\``);

      const index = parseInt(args[1] - 1);

      if (!guild.poi[index]) return message.channel.send(`There is no POI with an ID of ${args[1]}! Proper Usage: \`${guild.settings.prefix}poi add-alias <ID> <"name">\``);

      args = args.join(" ").split(/"(.*?)"/).map(a => a.trim());
      const name = args[1];

      if (!name) return message.channel.send(`Specify a name for your new alias! Proper Usage: \`${guild.settings.prefix}poi add-alias <ID> <"name">\``);

      if (guild.poi.find(p => p.aliases.some(a => a.toLowerCase() === name.toLowerCase()))) return message.channel.send("There is already an alias with that name!");

      const poi = guild.poi[index];
      if (poi.aliases.some(a => a.toLowerCase() === name.toLowerCase())) return message.channel.send("This POI already has that alias!");
      poi.aliases.push(name);

      bot.guildInfo.set(bot, {
        poi: guild.poi
      }, message.guild);

      message.channel.send(`The POI with an ID of **${index + 1}** has been given an alias of **${name}**`);
    } else if (args[0].toLowerCase() === "delete-alias") {
      if (!args[1]) return message.channel.send(`You must specify the ID of the poi you wish to remove an alias from! Proper Usage: \`${guild.settings.prefix}poi delete-alias <ID> <"name">\``);
      if (isNaN(args[1])) return message.channel.send(`Invalid ID. Proper Usage: \`${guild.settings.prefix}poi delete-alias <ID> <"name">\``);

      const index = parseInt(args[1] - 1);

      if (!guild.poi[index]) return message.channel.send(`There is no POI with an ID of ${args[1]}! Proper Usage: \`${guild.settings.prefix}poi delete-alias <ID> <"name">\``);

      args = args.join(" ").split(/"(.*?)"/).map(a => a.trim());
      const name = args[1];

      if (!name) return message.channel.send(`Specify the name of the alias you wish to remove! Proper Usage: \`${guild.settings.prefix}poi delete-alias <ID> <"name">\``);

      const poi = guild.poi[index];
      const poiAliases = poi.aliases;

      if (!poiAliases.find(a => a.toLowerCase() === name.toLowerCase())) return message.channel.send(`There is no alias with a name of ${name}! Proper Usage: \`${guild.settings.prefix}poi delete-alias <ID> <"name">\``);

      const aliasIndex = poiAliases.findIndex(a => a.toLowerCase() === name.toLowerCase());
      poi.aliases.splice(aliasIndex, 1);

      bot.guildInfo.set(bot, {
        poi: guild.poi
      }, message.guild);

      message.channel.send(`The alias with a name of **${name}** has been removed from the POI with an ID of **${index + 1}**`);
    } else if (args[0].toLowerCase() === "search") {
      if (guild.poi.length <= 0) return message.channel.send("This guild doesn't have any registered POI.");
      const searchResults = guild.poi.filter(p => p.name.toLowerCase().includes(args.slice(1).join(" ").toLowerCase()) || p.aliases.some(a => a.toLowerCase().includes(args.slice(1).join(" "))));

      if (searchResults.length <= 0) return message.channel.send("No Points of Interest were found for that search query.");

      const poiEmbed = new Discord.RichEmbed()
        .setAuthor("🔍 POI Search")
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      searchResults.forEach(poi => {
        poiEmbed.addField(poi.name.charAt(0).toUpperCase() + poi.name.slice(1), `**Directions:** [Google Maps](https://www.google.com/maps/place/${poi.latitude},${poi.longitude}), [Apple Maps](http://maps.apple.com/?daddr=${poi.latitude},${poi.longitude}), [Waze](https://www.waze.com/ul?ll=${poi.latitude}%2C${poi.longitude}&navigate=yes&zoom=14)\n**Aliases:** ${poi.aliases.length > 0 ? poi.aliases.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ") : "None"}\n**Type:** ${poi.type}\n**ID:** ${guild.poi.findIndex(p => p.name === poi.name) + 1}`, true);
      });

      message.channel.send(poiEmbed);
    } else if (args[0].toLowerCase() === "list") {
      if (guild.poi.length <= 0) return message.channel.send("This guild doesn't have any registered POI.");
      const poiEmbeds = [];
      const poi = [...guild.poi];
      const pageLength = 5;

      for (let i = 0; i < guild.poi.length; i += pageLength) {
        const poiEmbed = new Discord.RichEmbed()
          .setAuthor(`Page ${(i / pageLength) + 1}/${Math.ceil(guild.poi.length / pageLength)}`)
          .setColor(message.guild.me.displayHexColor)
          .setTimestamp();

        poi.splice(0, pageLength).forEach(p => {
          poiEmbed.addField(p.name.charAt(0).toUpperCase() + p.name.slice(1), `**Directions:** [Google Maps](https://www.google.com/maps/place/${p.latitude},${p.longitude}), [Apple Maps](http://maps.apple.com/?daddr=${p.latitude},${p.longitude}), [Waze](https://www.waze.com/ul?ll=${p.latitude}%2C${p.longitude}&navigate=yes&zoom=14)\n**Aliases:** ${p.aliases.length > 0 ? p.aliases.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ") : "None"}\n**Type:** ${p.type.charAt(0).toUpperCase() + p.type.slice(1)}\n**ID:** ${guild.poi.findIndex(P => P.name == p.name && P.type === p.type) + 1}`, true);
        });

        poiEmbeds.push(poiEmbed);
      }

      message.channel.send(poiEmbeds[0]).then(async msg => {
        if (poiEmbeds.length > 1) {
          await msg.react("◀");
          await msg.react("▶");

          let page = 1;

          const reactionFilter = (reaction, user) => (reaction.emoji.name === "◀" || reaction.emoji.name === "▶") && user.id === message.author.id;
          const reactionCollector = msg.createReactionCollector(reactionFilter, {
            time: (20000 * poiEmbeds.length)
          });

          reactionCollector.on("collect", async collected => {
            if (collected.emoji.name === "◀") {
              if (page === 1) return msg.reactions.first().remove(message.author);
              page--;

              await msg.edit(poiEmbeds[page - 1]);
              msg.reactions.first().remove(message.author);

            } else {
              if (page === poiEmbeds.length) return msg.reactions.last().remove(message.author);
              page++;

              await msg.edit(poiEmbeds[page - 1]);
              msg.reactions.last().remove(message.author);
            }
          });

          reactionCollector.on("end", () => {
            poiEmbeds[page - 1].setFooter("The reaction menu has expired.");
            msg.edit(poiEmbeds[page - 1]);
            msg.clearReactions();
          });
        }
      });
    }
  },
};
