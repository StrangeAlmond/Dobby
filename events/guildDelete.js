module.exports = async (bot, guild) => {
  console.log("Removed from guild");

  const users = await bot.userInfo.findAll({
    where: {
      guild: guild.id
    }
  });

  users.forEach(user => {
    bot.userInfo.delete(bot, bot.users.get(user.user), guild);
  });

  bot.guildInfo.delete(bot, guild);

  console.log("Guild data deleted successfully");
};
