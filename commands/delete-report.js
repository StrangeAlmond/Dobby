const Discord = require("discord.js");

module.exports = {
  name: "delete-report",
  description: "Delete a report",
  aliases: ["report-delete", "remove-report", "report-remove"],
  async execute(message, args, bot) {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have the required permissions for this command!");
    if (!args[0]) return message.channel.send("Specify the ID of the report you wish to delete!");
    if (isNaN(args[0])) return message.channel.send("Invalid ID.");

    const guild = await bot.guildInfo.get(bot, message.guild);

    const report = parseInt(args[0]) - 1;

    if (!guild.reports[report]) return message.channel.send(`There is no report with an ID of ${args[0]}!`);

    guild.reports.splice(report, 1);

    bot.guildInfo.set(bot, {
      reports: guild.reports
    }, message.guild);

    message.channel.send(`You have succesfully deleted the report with an ID of ${args[0]}`);
  },
};
