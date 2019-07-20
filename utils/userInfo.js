module.exports = {
  ensure: async function (bot, user, guild) {
    let userData = await bot.userInfo.findOne({
      where: {
        user: user.user || user.id,
        guild: guild.id
      }
    });

    if (!userData) {
      await bot.userInfo.create({
        user: user.user || user.id,
        guild: guild.id,
        reports: [],
        badges: [],
        listed: 0,
        ign: "",
        title: "",
        house: "",
        level: 1,
        xp: 0,
        stats: {
          foundablesReturned: 0,
          distanceWalked: 0,
          poiVisited: 0,
          challengesWon: 0
        },
        profession: "",
        friendCode: ""
      }).then(newUserData => {
        userData = newUserData;
      });
    }

    return userData;

  },

  get: async function (bot, user, guild) {
    const userData = await bot.userInfo.findOne({
      where: {
        user: user.user || user.id,
        guild: guild.id
      }
    });

    return userData;
  },

  set: async function (bot, newValues, user, guild) {
    const userData = await bot.userInfo.findOne({
      where: {
        user: user.user || user.id,
        guild: guild.id
      }
    });

    userData.update(newValues);
  },

  delete: async function (bot, user, guild) {
    bot.userInfo.destroy({
      where: {
        user: user.user || user.id,
        guild: guild.id
      }
    });
  }
};
