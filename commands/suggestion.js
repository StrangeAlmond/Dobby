const Discord = require("discord.js");

module.exports = {
  name: "suggestion",
  description: "Create a suggestion",
  aliases: ["suggest"],
  async execute(message, args, bot) {
    if (message.author.id !== "356172624684122113") return;
    args = message.content.split(/ +/);
    args.shift();

    args = args.join(" ").split(/"(.*?)"/);

    if (!args[1]) return message.channel.send("Specify a title");
    if (!args[2]) return message.channel.send("Specify a description");

    const title = args[1];
    const description = args[3];

    const suggestionEmbed = new Discord.RichEmbed()
      .setAuthor(title)
      .setDescription(description)
      .setColor("#B19F91");

    await message.delete();
    message.channel.send(suggestionEmbed).then(async msg => {
      await msg.react("👍");
      await msg.react("👎");
    });
  },
};
