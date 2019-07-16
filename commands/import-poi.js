const Discord = require("discord.js");
const csv = require("csvtojson");
const fs = require("fs");
const request = require("request");
const Coordinates = require("coordinate-parser");

module.exports = {
  name: "import-poi",
  description: "Import poi to your server from a .csv file.",
  aliases: ["import_poi", "importpoi"],
  async execute(message, args, bot) {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");
    if (message.attachments.size <= 0) return message.channel.send("Attach the .csv file of the POI you wish to import! Format: https://docs.google.com/spreadsheets/d/16xeEke1gW9QorfTEhFVqT0lmeKSAhw4Xvqbxh4uU48s/edit?usp=sharing");

    const fileObject = message.attachments.first();

    if (!fileObject.filename.endsWith(".csv")) return message.channel.send("Attach the .csv file of the POI you wish to import! Format: https://docs.google.com/spreadsheets/d/16xeEke1gW9QorfTEhFVqT0lmeKSAhw4Xvqbxh4uU48s/edit?usp=sharing");

    const file = fs.createWriteStream("./poiImport.csv");
    await request.get(fileObject.url)
      .on("error", console.error)
      .pipe(file);

    file.on("finish", async () => {

      const data = await csv().fromFile("./poiImport.csv");
      if (!data[0]) return message.channel.send("Attach the .csv file of the POI you wish to import! Format: https://docs.google.com/spreadsheets/d/16xeEke1gW9QorfTEhFVqT0lmeKSAhw4Xvqbxh4uU48s/edit?usp=sharing");

      const requiredFields = ["name", "latitude", "longitude", "type", "aliases"];
      let validFile = true;

      requiredFields.forEach(field => {
        if (!Object.keys(data[0]).some(k => k.toLowerCase() === field.toLowerCase())) validFile = false;
      });

      if (!validFile) return message.channel.send("Invalid .csv file! Format: https://docs.google.com/spreadsheets/d/16xeEke1gW9QorfTEhFVqT0lmeKSAhw4Xvqbxh4uU48s/edit?usp=sharing");

      const guild = await bot.guildInfo.get(bot, message.guild);
      const newPoi = [];

      data.forEach(poi => {
        const poiObject = {
          name: poi.Name,
          latitude: poi.Latitude,
          longitude: poi.Longitude,
          type: poi.Type,
          createdAt: Date.now(),
          createdBy: message.author.id,
          aliases: poi.Aliases.length > 0 ? poi.Aliases.split(/, /g) : []
        };

        if (!isPoiValid(poiObject, guild.poi)) return;

        newPoi.push(poiObject);
      });

      if (newPoi.length <= 0) return message.channel.send("There were no new POI in that .csv file.");

      guild.poi = guild.poi.concat(newPoi);
      await bot.guildInfo.set(bot, {
        poi: guild.poi
      }, message.guild);

      message.channel.send(`I have added ${newPoi.length} new POI to your server.`);
      fs.unlinkSync("./poiImport.csv");
    });

    function isPoiValid(poiObject, poiDb) {
      if (["name", "latitude", "longitude", "type"].some(i => !poiObject.hasOwnProperty(i))) return false;
      if (poiObject.name.length <= 0) return false;

      if (!isLocationValid(`${poiObject.latitude}, ${poiObject.longitude}`)) return false;
      if (isPoiDuplicate(poiObject.name, poiObject.type, poiDb)) return false;

      if (!["fortress", "greenhouse", "inn"].includes(poiObject.type.toLowerCase())) return false;
      if (!Array.isArray(poiObject.aliases)) return false;

      return true;
    }

    function isLocationValid(position) {
      try {
        new Coordinates(position);
        return true;
      } catch (e) {
        return false;
      }
    }

    function isPoiDuplicate(name, type, poiDb) {
      return poiDb.some(p => p.name.toLowerCase() === name.toLowerCase() && p.type.toLowerCase() === type.toLowerCase());
    }
  },
};
