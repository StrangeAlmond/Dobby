module.exports = async (bot, member) => {

  const guildData = await bot.guildInfo.get(bot, member.guild);

  if (guildData.settings.welcomeMessage) {
    if (!member.guild.channels.get(guildData.welcomeMessage.channel)) return;
    const message = guildData.welcomeMessage.message.replace(/{user}/g, member).replace(/{user.username}/g, member.user.username).replace(/{user.nickname}/g, member.displayName).replace(/{server}/g, member.guild.name);
    bot.channels.get(guildData.welcomeMessage.channel).send(message);
  }

  const memberData = await bot.userInfo.findAll({
    where: {
      user: member.id
    }
  });

  await bot.userInfo.ensure(bot, member.user, member.guild);

  if (memberData.length <= 0) return;

  if (memberData.find(m => m.profession.length > 0) && guildData.settings["profession-roles"]) {
    const profession = memberData.find(m => m.profession.length > 0).profession.toLowerCase();
    if (!member.guild.roles.find(r => r.name.toLowerCase() === profession)) {
      await member.guild.createRole({
        name: profession
      }).catch(err => console.error(err));
    }

    const role = member.guild.roles.find(r => r.name === profession);
    member.addRole(role).catch(err => console.error(err));
  }

  if (memberData.find(m => m.house.length > 0) && guildData.settings["house-roles"]) {
    const house = memberData.find(m => m.house.length > 0).house.toLowerCase();
    if (!member.guild.roles.find(r => r.name.toLowerCase() === house)) {
      await member.guild.createRole({
        name: house
      }).catch(err => console.error(err));
    }

    const role = member.guild.roles.find(r => r.name === house);
    member.addRole(role).catch(err => console.error(err));
  }

  const user = await bot.userInfo.get(bot, member.user, member.guild);
  user.xp = memberData[0].xp;
  user.level = memberData[0].level;
  user.title = memberData[0].title;
  user.ign = memberData[0].ign;
  user.stats = memberData[0].stats;
  user.friendCode = memberData[0].friendCode;

  bot.userInfo.set(bot, {
    xp: user.xp,
    level: user.level,
    title: user.title,
    ign: user.ign,
    stats: user.stats,
    friendCode: user.friendCode
  }, member.user, member.guild);
};
