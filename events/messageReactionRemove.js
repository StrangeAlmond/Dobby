module.exports = async (bot, reaction, user) => {
  if (reaction.message.author.id !== bot.user.id) return;
  if (user.id === bot.user.id) return;
  if (!reaction.message.embeds[0]) return;
  if (!reaction.message.embeds[0].author.name.toLowerCase().includes("has planted a")) return;
  if (reaction.emoji.name !== "✅") return;

  const guild = await bot.guildInfo.get(bot, reaction.message.guild);

  const planted = guild.planted.find(p => p.message === reaction.message.id);
  if (!planted) return;
  if (!planted.users.includes(user.id)) return;

  planted.users.splice(planted.users.indexOf(user.id), 1);
  guild.planted.splice(guild.planted.findIndex(p => p.message === reaction.message.id), 1, planted);

  bot.guildInfo.set(bot, {
    planted: guild.planted
  }, reaction.message.guild);
};
