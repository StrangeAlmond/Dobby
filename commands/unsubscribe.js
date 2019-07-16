const Discord = require("discord.js");
const sm = require("string-similarity");

module.exports = {
  name: "unsubscribe",
  description: "Unsubscribe from an alert",
  aliases: ["unsignup", "unwant"],
  async execute(message, args, bot) {
    const possibleSubscriptions = ["emergency", "severe", "high", "medium", "low"];

    if (!possibleSubscriptions.some(s => args[0].includes(s))) return;
    const subscription = sm.findBestMatch(args[0], possibleSubscriptions).bestMatch.target;

    if (!message.guild.roles.find(r => r.name.toLowerCase() === subscription)) {
      await message.guild.createRole({
        name: subscription,
        mentionable: true
      });
    }

    const role = await message.guild.roles.find(r => r.name.toLowerCase() === subscription);
    if (!message.member.roles.get(role.id)) return message.channel.send(`You haven't signed up for ${subscription} alerts!`);

    message.member.removeRole(role);
    message.channel.send(`You have unsubscribed from ${subscription} alerts!`);
  },
};
