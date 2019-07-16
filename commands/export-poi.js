const Discord = require("discord.js");
const json2csv = require("json2csv").Parser;
const fs = require("fs");

module.exports = {
  name: "export-poi",
  description: "Export your server's POI.",
  aliases: ["export_poi", "exportpoi"],
  async execute(message, args, bot) {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");

    const fields = ["Name", "Latitude", "Longitude", "Type", "Created At", "Created By", "Aliases"];
    const guild = await bot.guildInfo.get(bot, message.guild);
    if (guild.poi.length <= 0) return message.channel.send("Your server does not have any POI!");

    const keys = guild.poi.map(poi => {
      return {
        "Name": poi.name,
        "Latitude": poi.latitude,
        "Longitude": poi.longitude,
        "Type": poi.type,
        "Created At": poi.createdAt,
        "Created By": poi.createdBy,
        "Aliases": poi.aliases.join(", ")
      };
    });

    const parser = new json2csv({
      fields
    });

    const result = parser.parse(keys);

    fs.writeFileSync("./poiExport.csv", [result], "utf8");

    await message.channel.send(new Discord.Attachment("./poiExport.csv", `${message.guild.name}_POI_Export.csv`));

    fs.unlinkSync("./poiExport.csv");
  },
};
