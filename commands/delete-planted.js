const Discord = require("discord.js");

module.exports = {
  name: "delete-planted",
  description: "Delete a greenhouse from the growing list",
  aliases: ["planted-delete", "deleteplanted", "planteddelete", "greenhouse-delete", "delete-greenhouse", "greenhousedelete", "deletegreenhouse"],
  async execute(message, args, bot) {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have the required permissions for this command!");
    if (!args[0]) return message.channel.send("Specify the id of the greenhouse you'd like to remove from the planted list!");
    if (isNaN(args[0])) return message.channel.send("Invalid greenhouse ID!");

    const greenhouse = parseInt(args[0]) - 1;
    const guild = await bot.guildInfo.get(bot, message.guild);

    if (!guild.planted[greenhouse]) return message.channel.send("Invalid greenhouse ID!");

    guild.planted.splice(greenhouse, 1);
    await bot.guildInfo.set(bot, {
      planted: guild.planted
    }, message.guild);

    message.channel.send(`You have deleted the greenhouse with an ID of **${greenhouse + 1}**`);
  },
};
