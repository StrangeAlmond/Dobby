module.exports = {
  ensure: async function (bot, guild) {
    const hasManageRoles = guild.me.hasPermission("MANAGE_ROLES");

    let guildData = await bot.guildInfo.findOne({
      where: {
        guild: guild.id
      }
    });

    if (!guildData) {
      await bot.guildInfo.create({
        guild: guild.id,
        poi: [],
        reports: [],
        badges: [],
        disabledCommands: [],
        settings: {
          "profession-roles": hasManageRoles,
          "house-roles": hasManageRoles,
          "listed": false,
          "trusted-role": "",
          "prefix": "!",
          "welcomeMessage": false
        },
        location: {
          "coordinates": "",
          "location": ""
        },
        planted: [],
        welcomeMessage: {
          message: "Welcome to {server} {user.nickname}!",
          channel: null
        }
      }).then(newGuilData => guildData = newGuilData);
    }

    return guildData;
  },

  get: async function (bot, guild) {
    const guildData = await bot.guildInfo.findOne({
      where: {
        guild: guild.id
      }
    });

    return guildData;
  },

  set: async function (bot, newValues, guild) {
    const guildData = await bot.guildInfo.findOne({
      where: {
        guild: guild.id
      }
    });

    guildData.update(newValues);
  },

  delete: async function (bot, guild) {
    bot.guildInfo.destroy({
      where: {
        guild: guild.id
      }
    });
  }
};
