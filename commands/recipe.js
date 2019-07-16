const Discord = require("discord.js");
const sm = require("string-similarity");

module.exports = {
  name: "recipe",
  description: "View the recipe for a potion",
  aliases: ["potion"],
  async execute(message, args, bot) {
    const potionData = {
      "Baruffio's Brain Elixir": {
        "description": "Grants you extra Wizarding XP from each Trace and Portkey you complete",
        "level": 1,
        "brewingTime": "12h 0m",
        "ingredients": ["2 Leaping Toadstools", "1 Frog Brains", "1 Runespoor Eggs", "1 Powdered Dragon Claw"],
        "masterNotes": ["Clockwise turn inside the Cauldron ", "Pinch the brewing Potion in the Cauldron", "Horizontal line across the Cauldron", "Horizontal line across the Cauldron", "Zoom out on the brewing Potion in the Cauldron", "Shake your device"],
        "color": "#4DCA7B"
      },
      "Dawdle Draught": {
        "description": "Reduces a Confoundable's likelihood of fleeing with the Foundable, giving you more chances to cast spells in a Trace",
        "level": 10,
        "brewingTime": "6h 0m",
        "ingredients": ["2 Valerian Root", "1 Sopophorous Beans", "1 Butterscotch", "1 Hermit Crab Shell"],
        "masterNotes": ["Shake your device", "Clockwise turn inside the Cauldron", "Counter-Clockwise turn inside the Cauldron", "Counter-Clockwise turn inside the Cauldron", "Pinch the brewing Potion in the Cauldron"],
        "color": "#AA5102"
      },
      "Exstimulo Potion": {
        "description": "Improves your spellcast in both combat and Traces",
        "level": 1,
        "brewingTime": "2h 0m",
        "ingredients": ["1 Re'em blood", "1 Granian Hair", "1 Snowdrop", "1 Bitter Root"],
        "masterNotes": ["Vertical line across the Cauldron", "Vertical line across the Cauldron", "Clockwise turn inside the Cauldron"],
        "color": "#78ECF2"
      },
      "Invigoration Draught": {
        "description": "Grants 1 Focus for casting Strategic Spells in Wizarding Challenges",
        "level": 8,
        "brewingTime": "3h 0m",
        "ingredients": ["1 vervain infusion", "1 scurvygrass", "2 lovage"],
        "masterNotes": ["Horizontal line across the cauldron", "Vertical line across the cauldron", "Vertical line across the cauldron", "Zoom out on the brewing potion in the cauldron"],
        "color": "#FEBB39"
      },
      "Strong Invigoration Draught": {
        "description": "Grants 3 Focus for casting Strategic Spells in Wizarding Challenges",
        "level": 13,
        "brewingTime": "6h 0m",
        "ingredients": ["1 vervain infusion", "1 scurvygrass", "2 sneezewort"],
        "masterNotes": ["Horizontal line across the cauldron", "Vertical line across the cauldron", "Vertical line across the cauldron", "Vertical line across the cauldron", "Zoom out on the cauldron", "Zoom out on the cauldron"],
        "color": "#F75006"
      },
      "Strong Exstimulo Potion": {
        "description": "Greatly improves the next cast in Traces and Challenges",
        "level": 6,
        "brewingTime": "6h 0m",
        "ingredients": ["2 Bitter Root", "2 Snowdrop", "1 Re'em Blood", "1 Abraxan Hair"],
        "masterNotes": ["Vertical line across the Cauldron", "Vertical line across the Cauldron", "Counter-Clockwise turn inside the Cauldron", "Clockwise turn inside the Cauldron"],
        "color": "#023386"
      },
      "Potent Exstimulo Potion": {
        "description": "Greatly improves your spellcast in both Combat and Traces",
        "level": 9,
        "brewingTime": "8h 0m",
        "ingredients": ["2 Bitter Root", "2 Snowdrop", "2 Re'em blood", "1 Unicorn Hair"],
        "masterNotes": ["Vertical line across the Cauldron", "Horizontal line across the Cauldron", "Vertical line across the Cauldron", "Counter-Clockwise turn inside the Cauldron", "Clockwise turn inside the Cauldron", "Counter-Clockwise turn inside the Cauldron"],
        "color": "#052F7C"
      },
      "Healing Potion": {
        "description": "Restores Stamina that you have lost in combat",
        "level": 6,
        "brewingTime": "3h 0m",
        "ingredients": ["1 Dragon Liver", "1 Wormwood", "1 Bubotuber Pus", "1 Dittany"],
        "masterNotes": ["Zoom out on the brewing Potion in the Cauldron", "Clockwise turn inside the Cauldron", "Tap multiple times on the brewing Potion in the Cauldron", "Pinch the brewing Potion in the Cauldron"],
        "color": "#E62141"
      },
      "Wit-Sharpening Potion": {
        "description": "Increases your spell’s efficacy against Master Foes in Challenges",
        "level": 15,
        "brewingTime": "4h 0m",
        "ingredients": ["1 Ginger Root", "1 Newt Spleen", "1 Ground Scarab Beetles", "1 Armadillo Bile"],
        "masterNotes": ["Zoom out on the brewing Potion in the Cauldron", "Vertical line across the Cauldron", "Vertical line across the Cauldron", "Tap multiple times on the brewing Potion in the Cauldron"],
        "color": "#1C775B"
      }
    };

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
