const Discord = require("discord.js");

module.exports = {
  name: "set-title",
  description: "Set your title!",
  aliases: ["settitle"],
  async execute(message, args, bot) {
    const userData = await bot.userInfo.get(bot, message.author, message.guild);
    const guildData = await bot.guildInfo.get(bot, message.guild);

    const choices = ["Calamity Investigator", "Strategic Spellcaster", "Elixir Enthusiast", "Superior Spellcaster", "Statute of Secrecy Supporter", "Challenge Champion", "Eliminator of Elites", "Masterful Magizoologist", "Proficient Professor", "S.O.S Ambassador", "Accomplished Auror", "Advance Guard", "Accomplished Archivist", "Herbaceous Harvester", "Wizarding Wander", "Diligent Diner", "Portkey Passenger", "Helpful Herbologist", "Detector Distributor", "Chamber Challenger", "Practiced Potioneer"];

    args = args.join(" ").split(/, +/g);

    if (!args[0]) return message.channel.send(`Specify a new title! Proper Usage: \`${guildData.settings.prefix}set-title <choice1>, [choice2], [choice3]\``);
    if (!choices.find(c => args[0].replace(/'/g, "") === c.toLowerCase().replace(/'/g, ""))) return message.channel.send(`Invalid title! Proper Usage: \`${guildData.settings.prefix}set-title <choice1>, [choice2], [choice3]\``);

    const newTitles = [];

    args.forEach(arg => {
      newTitles.push(choices.find(c => arg.replace(/'/g, "") === c.toLowerCase().replace(/'/g, "")));
    });

    if (newTitles.length <= 0) return message.channel.send(`Invalid title(s)! Proper Usage: \`${guildData.settings.prefix}set-title <choice1>, [choice2], [choice3]\``);

    const title = newTitles.map(t => `• ${t}`).join("\n");

    userData.title = title;
    await bot.userInfo.update({
      title: userData.title
    }, {
      where: {
        user: message.author.id
      }
    });

    message.channel.send(`You have chosen the title${newTitles.length > 1 ? "s" : ""} ${newTitles.join(", ")}!`);

    // else {
    //   let titles = {choices.map(c => `${emoji[choices.indexOf(c)]} **${c}**`).join("\n");}

    //   const embed = new Discord.RichEmbed()
    //     .setAuthor("Titles", message.author.displayAvatarURL)
    //     .setDescription(`${titles}\n\n✅ Confirm Selections`)
    //     .setColor(message.guild.me.displayHexColor)
    //     .setTimestamp();

    //   message.channel.send(embed).then(async msg => {
    //     for (let i = 0; i < choices.length; i++) {
    //       await msg.react(emoji[i]);
    //     }

    //     await msg.react("✅");

    //     const reactionFilter = (reaction, user) => (emoji.includes(reaction.emoji.name) || reaction.emoji.name === "✅") && user.id === message.author.id;
    //     const reactionCollector = msg.createReactionCollector(reactionFilter, {
    //       time: 120000
    //     });

    //     let titlesChosen = [];

    //     reactionCollector.on("collect", async collected => {
    //       if (collected.emoji.name !== "✅") {
    //         if (!choices[emoji.indexOf(collected.emoji.name)]) return;
    //         if (titlesChosen.length > 3) titlesChosen = titlesChosen.splice(0, 3);
    //         titlesChosen = msg.reactions.filter(r => emoji.includes(r.emoji.name) && r.users.has(message.author.id)).map(r => choices[emoji.indexOf(r.emoji.name)]);
    //       } else {
    //         if (titlesChosen.length > 3) titlesChosen = titlesChosen.splice(0, 3);
    //         message.channel.send(`You have chosen the following titles:\n${titlesChosen.map(t => `• ${t}`).join("\n")}`);
    //         msg.clearReactions();

    //         const usersData = await bot.userInfo.findAll({
    //           where: {
    //             user: message.author.id
    //           }
    //         });

    //         usersData.forEach(user => {
    //           user.title = titlesChosen.map(t => `• ${t}`).join("\n");
    //           bot.userInfo.set(bot, {
    //             title: user.title
    //           }, message.author, message.guild);
    //         });
    //       }
    //     });

    //     reactionCollector.on("end", () => {
    //       msg.clearReactions();
    //       embed.setFooter("The reaction menu has expired.");
    //       msg.edit(embed);
    //     });

    //   });
    // }
  },
};
