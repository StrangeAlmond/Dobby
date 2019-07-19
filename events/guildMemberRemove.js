module.exports = async (bot, member) => {
  const user = await bot.userInfo.get(bot, member.user, member.guild);

  if (!user) return;

  bot.logger.log("info", "User left guild.");

  await bot.userInfo.delete(bot, member.user, member.guild);

  bot.logger.log("info", "User's data deleted.");
};
