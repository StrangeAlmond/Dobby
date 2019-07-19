module.exports = async (bot, guild, member) => {
  const user = await bot.userInfo.get(bot, member.user, guild);

  if (!user) return;

  bot.logger.log("info", "User banned from guild.");

  await bot.userInfo.delete(bot, member.user, guild);

  bot.logger.log("info", "User's data deleted.");
};
