const Discord = require("discord.js");
const collectors = {};

module.exports = {
  name: "configure",
  description: "Configure a setting.",
  aliases: ["config"],
  async execute(message, args, bot) {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the required permissions for this command!");

    function awaitResponse(messageContent, filter) {
      return new Promise(async (resolve, reject) => {

        message.channel.send(messageContent);

        if (collectors[message.author.id]) {
          endCollector(message.author.id);
        }

        const collector = new Discord.MessageCollector(message.channel, filter);

        collectors[message.author.id] = collector;

        const collectorEnd = setTimeout(() => {
          endCollector(message.author.id);
          reject(undefined);
        }, 120000);

        collector.on("collect", msg => {

          resolve(msg);
          clearTimeout(collectorEnd);

          endCollector(message.author.id);
        });
      });
    }

    function endCollector(ID) {
      collectors[ID].stop();
      delete collectors[ID];
    }

    if (args[0] === "welcome") {
      const guild = await bot.guildInfo.get(bot, message.guild);
      const enabled = await awaitResponse("Would you like to enable the welcome message for this server? Reply `yes` or `no`", m => (m.content.toLowerCase() === "yes" || m.content.toLowerCase() === "no") && m.author.id === message.author.id);
      if (enabled.content === "no") {
        if (guild.settings.welcomeMessage) {
          guild.settings.welcomeMessage = false;

          bot.guildInfo.set(bot, {
            settings: guild.settings,
            welcomeMessage: guild.welcomeMessage
          }, message.guild);
        }

        message.channel.send("Got it! I have disabled the welcome message for this server!");

        return;
      }

      if (!guild) return;
      guild.settings.welcomeMessage = true;

      const welcomeMessage = await awaitResponse("What would you like your welcome message to say?\n{user} = mention user\n{user.username} user's username\n{user.nickname} user's nickname in the server\n{server} server's name", m => m.content.trim().length > 0 && m.author.id === message.author.id);
      if (!welcomeMessage) return;
      guild.welcomeMessage.message = welcomeMessage.content;

      let channel = await awaitResponse("Which channel would you like your welcome message to be in?", m => (m.mentions.channels.first() || m.guild.channels.find(c => c.name.toLowerCase() === m.content.toLowerCase()) || m.guild.channels.get(m.content)) && m.author.id === message.author.id);
      if (!channel) return;
      channel = channel.mentions.channels.first() || channel.guild.channels.find(c => c.name.toLowerCase() === channel.content.toLowerCase()) || channel.guild.channels.get(channel.content);
      guild.welcomeMessage.channel = channel.id;

      message.channel.send(`Got it! I have set your welcome message to **${welcomeMessage}** and your channel to <#${channel.id}>!`);
      bot.guildInfo.set(bot, {
        settings: guild.settings,
        welcomeMessage: guild.welcomeMessage
      }, message.guild);
    }
  },
};
