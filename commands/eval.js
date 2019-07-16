const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports = {
  name: "eval",
  description: "You know what this is",
  aliases: ["evaluate"],
  async execute(message, args, bot) {
    // Only I can use this command
    if (message.author.id !== "356172624684122113") return;

    // Evaluate the code
    try {
      // Get the code
      const code = message.content.slice(6);

      // Evaled code
      const ev = require("util").inspect(eval(code));

      // Replace bot token if its in the evaluation
      if (ev.includes(botconfig.token)) ev.replace(/botConfig.token/gi, "Bot-Token-Replacement");

      // Too long to send
      if (ev.length > 1900) {
        return message.channel.send("This worked but the response code is too long to send").then(msg => {
          msg.delete(30000);
          message.delete(60000);
        });
      }

      // Send the response code
      message.channel.send(`**Input:**\n\`\`\`js\n${code}\`\`\`\n\n**Eval:**\`\`\`js\n${ev}\`\`\``).then(msg => {
        msg.delete(30000);
        message.delete(60000);
      });

    } catch (err) {
      // ERROR - DOES NOT COMPUTE
      message.channel.send(`**Error:**\n!\`\`\`js\n${err}\`\`\``).then(msg => {
        msg.delete(30000);
        message.delete(60000);
      });
    }
  },
};
