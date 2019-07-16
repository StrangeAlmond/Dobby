const Discord = require("discord.js");

module.exports = {
  name: "subscriptions",
  description: "View your subscriptions",
  async execute(message, args, bot) {
    const subscriptions = ["emergency", "severe", "high", "medium", "low"];
    const userSubscriptions = subscriptions.filter(s => message.member.roles.find(r => r.name === s)).map(s => `**${s.charAt(0).toUpperCase() + s.slice(1)}**`).join(", ");

    const subscriptionsEmbed = new Discord.RichEmbed()
      .setAuthor(`${message.member.displayName}'s Subscriptions`, message.author.displayAvatarURL)
      .setColor(message.guild.me.displayHexColor)
      .setDescription(userSubscriptions)
      .setTimestamp();

    message.channel.send(subscriptionsEmbed);
  },
};
