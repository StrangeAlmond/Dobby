const Discord = require("discord.js");

module.exports = {
  name: "settings",
  description: "View your server's settings",
  aliases: ["server-settings"],
  async execute(message, args, bot) {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");

    const guild = await bot.guildInfo.get(bot, message.guild);

    const settingsEmbed = new Discord.RichEmbed()
      .setAuthor("Server Settings", message.guild.iconURL)
      .setColor(message.guild.me.displayHexColor)
      .addField("Prefix", guild.settings.prefix, true)
      .setTimestamp();

    if (!guild.disabledCommands.includes("set-trusted-role")) {
      settingsEmbed.addField("Trusted Role", guild.settings["trusted-role"].length <= 0 ? `Use **${guild.settings.prefix}set-trusted-role <trusted role's name>** to set your server's trusted role.` : message.guild.roles.get(guild.settings["trusted-role"]), true);
    }

    if (!guild.disabledCommands.includes("set-location")) {
      settingsEmbed.addField("Location", guild.location.location.length <= 0 ? `Unknown. Use **${guild.settings.prefix}set-location <coordinates>** to set your location.` : guild.location.location, true);
    }

    settingsEmbed.addField("Disabled Commands", `${guild.disabledCommands.length > 0 ? guild.disabledCommands.map(c => `${guild.settings.prefix}${c}`).join("\n") : "N/A"}`, true);
    settingsEmbed.addField("Toggles", `\`profession-roles\` ${guild.settings["profession-roles"] ? "Enabled" : "Disabled"}\n\`house-roles\` ${guild.settings["house-roles"] ? "Enabled" : "Disabled"}\n\`listed\` ${guild.settings["listed"] ? "Yes" : "No"}`, true);

    if (guild.settings.welcomeMessage) {
      settingsEmbed.addField("Welcome Message", `**Channel:** <#${guild.welcomeMessage.channel}>\nWelcome Message: ${guild.welcomeMessage.message}`);
    }

    message.channel.send(settingsEmbed);

  },
};
