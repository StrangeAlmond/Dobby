const Discord = require("discord.js");
const potionData = require("../data/potions.json");

module.exports = {
  name: "recipe",
  description: "View the recipe for a potion",
  aliases: ["potion"],
  async execute(message, args, bot) {
    const emojiGuild = bot.guilds.get("557272213775187988");
    const hasExternalEmojiPerms = message.channel.permissionsFor(message.guild.me).toArray().includes("USE_EXTERNAL_EMOJIS");

    if (!args[0]) {
      const potionsEmbed = new Discord.RichEmbed()
        .setTitle("Available Potions")
        .setDescription(Object.keys(potionData).map(p => `${hasExternalEmojiPerms ? emojiGuild.emojis.find(e => e.name.toLowerCase() === p.replace(/['()]/g, "").replace(/-/g, " ").toLowerCase().split(/ +/).join("_")) : ""} ${p}`).join("\n"))
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp();

      if (!hasExternalEmojiPerms) potionsEmbed.setFooter("Note: I am missing the \"Use External Emojis\" permission");

      message.channel.send(potionsEmbed);
      return;
    }

    if (args[0]) {
      const usersData = await bot.userInfo.get(bot, message.author, message.guild);
      const guildData = await bot.guildInfo.get(bot, message.guild);

      const searchQuery = args.join(" ").replace(/'/g, "").replace(/-/g, " ");

      const potion = Object.keys(potionData).find(p => p.toLowerCase().replace(/'/g, "").replace(/-/g, " ").includes(searchQuery));

      if (!potion) return message.channel.send("I couldn't find that potion.");

      const potionObject = potionData[potion];

      const ingredients = potionObject.ingredients.map(i => `${hasExternalEmojiPerms ? emojiGuild.emojis.find(e => i.replace(/[']/g, "").replace(/-/g, " ").toLowerCase().split(/ +/).slice(1).join("_").includes(e.name.toLowerCase())) : ""} ${i}`).join("\n");
      const masterNotes = potionObject.masterNotes.map(n => `${hasExternalEmojiPerms && n.split(/ +/)[0].toLowerCase() !== "unknown" ? emojiGuild.emojis.find(e => n.replace(/-/g, "_").split(/ +/)[0].toLowerCase() === e.name.toLowerCase()) : ""} ${n}`).join("\n");

      const emoji = emojiGuild.emojis.find(e => e.name.toLowerCase() === potion.replace(/['()]/g, "").replace(/-/g, " ").toLowerCase().split(/ +/).join("_"));

      const potionEmbed = new Discord.RichEmbed()
        .setTitle(`${hasExternalEmojiPerms ? emoji : ""} ${potion}`)
        .setDescription(`**Description:** ${potionObject.description}\n**Unlocked At:** Level ${potionObject.level} ${!guildData.disabledCommands.includes("set-level") ? `(You are level ${usersData.level})` : ""}\n**Brewing Time:** ${potionObject.brewingTime}\n\n**Ingredients:**\n${ingredients}\n\n**Master Notes:**\n${masterNotes}`)
        .setColor(potionObject.color)
        .setTimestamp();

      if (!hasExternalEmojiPerms) potionEmbed.setFooter("Note: I am missing the \"Use External Emojis\" permission");
      message.channel.send(potionEmbed);
    }
  },
};
