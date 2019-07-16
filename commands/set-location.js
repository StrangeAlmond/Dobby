const Discord = require("discord.js");
const Coordinates = require("coordinate-parser");
const nodeFetch = require("node-fetch");
const botConfig = require("../botconfig.json");

module.exports = {
  name: "set-location",
  description: "Set your server's coordinates",
  aliases: ["set_coordinates", "setlocation", "setcoordinates"],
  async execute(message, args, bot) {
    if (!args[0]) return message.channel.send("Specify coordinates to set your server to!");

    function isLocationValid(position) {
      try {
        new Coordinates(position);
        return true;
      } catch (e) {
        return false;
      }
    }

    if (!isLocationValid(args.join(" "))) return message.channel.send("Invalid Coordinates.");
    const location = new Coordinates(args.join(" "));

    let locationObject = await nodeFetch(`https://us1.locationiq.com/v1/reverse.php?key=${botConfig.locationIQ}&lat=${location.latitude}&lon=${location.longitude}&format=json`, {
      method: "GET"
    });

    locationObject = await locationObject.json();

    const guild = await bot.guildInfo.get(bot, message.guild);
    if (guild.location.coordinates === `${location.latitude}, ${location.longitude}`) return message.channel.send("Your server is already set to these coordinates!");
    const city = locationObject.address.city || locationObject.address.town || locationObject.address.village || locationObject.address.suburb || locationObject.address.hamlet;
    const state = locationObject.address.state || locationObject.address.county;

    guild.location = {
      "coordinates": `${location.latitude}, ${location.longitude}`,
      "location": `${!city ? "" : `${city}, `}${state}`
    };

    bot.guildInfo.set(bot, {
      location: guild.location
    }, message.guild);
    message.channel.send(`Got it! Your server's location is now set to **${guild.location.location}**`);
  },
};
