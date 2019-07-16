const Discord = require("discord.js");

module.exports = {
  name: "disable-command",
  description: "Disable a command",
  aliases: ["command-disable"],
  async execute(message, args, bot) {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");

    const guild = await bot.guildInfo.get(bot, message.guild);

    let command = args[0];
    if (command.startsWith(guild.settings.prefix)) command = command.slice(guild.settings.prefix.length);

    if (!bot.commands.has(command)) {
      return message.reply("❌ | That command does not exist");
    }

    const blacklistedCommands = ["disable-command", "enable-command", "help", "settings", "set-prefix", "toggle", "reset", "configure"];

    if (guild.disabledCommands.includes(command)) return message.channel.send("That command is already disabled!");
    if (blacklistedCommands.includes(command)) return message.channel.send("You can't disable that command!");

    guild.disabledCommands.push(command);

    await bot.guildInfo.set(bot, {
      disabledCommands: guild.disabledCommands
    }, message.guild);

    message.channel.send(`The \`${guild.settings.prefix}${command}\` command has been disabled!`);
  },
};
