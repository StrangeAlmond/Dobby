module.exports = async (bot, guild) => {
  console.log("Added to new guild");
  bot.guildInfo.ensure(bot, guild);
};
