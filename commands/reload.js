const Discord = require("discord.js");

module.exports = {
  name: "reload",
  description: "reload a command",
  async execute(message, args, bot, getUserFromMention) {
    if (message.author.id !== "356172624684122113") return;
    if (!args[0] || args.size < 1) return message.reply("Must provide a command name to reload.");

    args = args.join(" ").split(/, +/);
    let reloadMessage = "";

    for (let i = 0; i < args.length; i++) {
      const commandName = args[i];
      const command = bot.commands.get(commandName) || bot.commands.find(c => c.aliases && c.aliases.includes(commandName));

      if (!command) {
        reloadMessage += `❌ | The \`!${commandName}\` command does not exist\n`;
      } else {

        await delete require.cache[require.resolve(`./${command.name}.js`)];
        await bot.commands.delete(command.name);
        const props = await require(`./${command.name}.js`);

        await bot.commands.set(commandName, props);
        reloadMessage += `The !${command.name} command has been reloaded.\n`;
      }
    }

    message.channel.send(reloadMessage).then(msg => msg.delete(5000) && message.delete(5000));
  },
};
