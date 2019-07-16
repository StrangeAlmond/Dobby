const Discord = require("discord.js");

module.exports = {
  name: "set-trusted-role",
  description: "Set your server's trusted role.",
  aliases: ["set-trusted", "settrustedrole", "settrusted"],
  async execute(message, args, bot) {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have the required permissions for this command!");
    if (!args[0]) return message.channel.send("Specify the name of the role you would like to set your server's trusted role to!");
    args = message.content.split(/ +/);
    args.shift();
    const roleName = args.join(" ");

    if (!message.guild.roles.find(r => r.name.toLowerCase() === roleName.toLowerCase())) return message.channel.send(`I could not find a role with the name ${roleName}. Does the role exist?`);
    const role = message.guild.roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());

    const guildData = await bot.guildInfo.get(bot, message.guild);
    guildData.settings["trusted-role"] = role.id;

    bot.guildInfo.set(bot, {
      settings: guildData.settings
    }, message.guild);

    message.channel.send(`I have set your server's trusted role to the **${role.name}** role.`);
  },
};
