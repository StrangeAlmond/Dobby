const Discord = require("discord.js");

module.exports = {
  name: "dark-detector",
  description: "Report a dark detector at a fortress.",
  aliases: ["darkdetector", "dark_detector"],
  async execute(message, args, bot) {
    const guildData = await bot.guildInfo.get(bot, message.guild);

    if (!args[0]) return message.channel.send(`Specify the amount of dark detectors! Proper Usage: \`${guildData.prefix}dark-detector <amount> <fortress>\``);
    if (!args[1]) return message.channel.send(`Specify the fortress the dark detector is at! Proper Usage: \`${guildData.prefix}dark-detector <amount> <fortress>\``);

    if (guildData.darkDetectors.find(d => d.fortress === args.slice(1).join(" "))) return message.channel.send("That fortress' dark detector has already been reported!");

    const amount = parseInt(args[0]);
    const fortress = args.slice(1).join(" ");

    if (isNaN(amount)) return message.channel.send(`Invalid amount of dark detectors! Proper Usage: \`${guildData.prefix}dark-detector <amount> <fortress>\``);
    if (amount > 3 || amount < 1) return message.channel.send(`The amount of dark detectors should be between 1 and 3! Proper Usage: \`${guildData.prefix}dark-detector <amount> <fortress>\``);

    const object = {
      amount: amount,
      fortress: fortress,
      time: Date.now()
    };

    guildData.darkDetectors.push(object);

    bot.guildInfo.set(bot, {
      darkDetectors: guildData.darkDetectors
    }, message.guild);

    const role = message.guild.roles.find(r => r.name.toLowerCase() === "dark-detector");

    const embed = new Discord.RichEmbed()
      .setAuthor("Dark detector reported!", message.author.displayAvatarURL)
      .setDescription(`**${fortress}** has **${amount}** dark detectors!`)
      .setColor(message.guild.me.displayHexColor)
      .setTimestamp();

    if (role) {
      message.channel.send(role, embed);
    } else {
      message.channel.send(embed);
    }
  },
};
