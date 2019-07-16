const Discord = require("discord.js");

module.exports = {
  name: "enable-command",
  description: "Enable a command",
  aliases: ["command-enable"],
  async execute(message, args, bot) {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");

    const guild = await bot.guildInfo.get(bot, message.guild);

    let command = args[0];
    if (command.startsWith(guild.settings.prefix)) command = command.slice(guild.settings.prefix.length);

    if (!bot.commands.has(command)) {
      return message.reply("❌ | That command does not exist");
    }

    guild.disabledCommands.splice(guild.disabledCommands.indexOf(command), 1);

    await bot.guildInfo.set(bot, {
      disabledCommands: guild.disabledCommands
    }, message.guild);

    message.channel.send(`The \`${guild.settings.prefix}${command}\` command has been enabled!`);
  },
};
