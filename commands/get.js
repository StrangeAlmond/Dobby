const Discord = require("discord.js");

module.exports = {
  name: "get",
  description: "Get a value",
  aliases: ["check"],
  async execute(message, args, bot) {
    if (args[0] === "perms" || args[0] === "permissions") {
      let channel = message.channel;
      if (message.guild.channels.get(args[1])) channel = message.guild.channels.get(args[1]);

      const possiblePermissions = ["MANAGE_ROLES", "MANAGE_GUILD", "CHANGE_NICKNAME", "SEND_MESSAGES", "EMBED_LINKS", "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "CREATE_INSTANT_INVITE", "VIEW_CHANNEL", "MANAGE_MESSAGES", "ATTACH_FILES", "ADD_REACTIONS"];
      const permissions = channel.permissionsFor(message.guild.me).toArray().filter(p => possiblePermissions.includes(p));
      const missingPerms = possiblePermissions.filter(p => !permissions.includes(p));

      const permsEmbed = new Discord.RichEmbed()
        .setAuthor("Dobby's Permissions", bot.user.displayAvatarURL)
        .setColor(message.guild.me.displayHexColor)
        .addField("Has", permissions.map(p => capitalizeWords(p.toLowerCase().replace(/_/g, " "))).join("\n") || "None", true)
        .addField("Missing", missingPerms.map(p => capitalizeWords(p.toLowerCase().replace(/_/g, " "))).join("\n") || "None")
        .setTimestamp();
      message.channel.send(permsEmbed);
    }

    function capitalizeWords(str) {
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
  },
};
