const Discord = require("discord.js");
const collectors = {};

module.exports = {
  name: "set-stats",
  description: "Set your statistics",
  aliases: ["set-statistics", "setstats", "setstatistics"],
  async execute(message, args, bot) {
    function awaitResponse(messageContent) {
      return new Promise(async (resolve, reject) => {

        message.channel.send(messageContent);

        if (collectors[message.author.id]) {
          endCollector(message.author.id);
        }

        const filter = m => m.author.id === message.author.id;
        const collector = new Discord.MessageCollector(message.channel, filter);

        collectors[message.author.id] = collector;

        const collectorEnd = setTimeout(() => {
          endCollector(message.author.id);
          reject(undefined);
        }, 120000);

        collector.on("collect", msg => {

          if (isNaN(msg.content)) return msg.channel.send("The specified value must be a number!");
          if (parseInt(msg.content) < 0) return message.channel.send("The specified value must be a positive number!");

          resolve(msg.content);
          clearTimeout(collectorEnd);

          endCollector(message.author.id);
        });
      });
    }

    function endCollector(ID) {
      collectors[ID].stop();
      delete collectors[ID];
    }

    message.channel.send("I am going to send a series of messages, to set your stats, respond with the value corresponding with the question.");

    setTimeout(async () => {
      const userData = await bot.userInfo.get(bot, message.author, message.guild);

      const foundablesReturned = await awaitResponse("How many foundables have you returned?").catch(err => console.error(err));
      if (!foundablesReturned) return;
      const distanceWalked = await awaitResponse("How many kilometers have you walked?").catch(err => console.error(err));
      if (!distanceWalked) return;
      const poiVisited = await awaitResponse("How many Inns and Greenhouses have you visited?").catch(err => console.error(err));
      if (!poiVisited) return;
      const challengesWon = await awaitResponse("How many wizarding challenges have you won?").catch(err => console.error(err));
      if (!challengesWon) return;

      userData.stats.foundablesReturned = parseInt(foundablesReturned);
      userData.stats.distanceWalked = parseInt(distanceWalked);
      userData.stats.poiVisited = parseInt(poiVisited);
      userData.stats.challengesWon = parseInt(challengesWon);

      await bot.userInfo.update({
        stats: userData.stats
      }, {
        where: {
          user: message.author.id
        }
      });

      message.channel.send(`Got it! I have set your foundables returned to **${foundablesReturned}**, your kilometers walked to **${distanceWalked}**, your inns and greenhouses visited to **${poiVisited}**, and your wizarding challenges won to **${challengesWon}**!`);

    }, 1000);
  },
};
