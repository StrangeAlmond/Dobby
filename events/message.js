const Discord = require("discord.js");
const moment = require("moment-timezone");

module.exports = async (bot, message) => {
  if (message.author.bot || message.channel.type === "dm") return;

  if (message.content.includes("’")) message.content = message.content.replace(/’/g, "'");

  const guildData = await bot.guildInfo.ensure(bot, message.guild);
  const userData = await bot.userInfo.ensure(bot, message.author, message.guild);

  if (userData.house.length > 0 && guildData.settings["house-roles"] && !message.member.roles.find(r => r.name.toLowerCase() === userData.house.toLowerCase())) {
    if (message.member.roles.find(r => ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"].includes(r.name.toLowerCase()))) {
      message.member.removeRole(message.member.roles.find(r => ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"].includes(r.name.toLowerCase()))).catch(err => console.error(err));
    }

    let role = message.guild.roles.find(r => r.name.toLowerCase() === userData.house.toLowerCase());
    if (!role) {
      await message.guild.createRole({
        name: userData.house.toLowerCase()
      }).then(newRole => role = newRole);
    }

    message.member.addRole(role).catch(err => console.error(err));

  }

  if (userData.profession.length > 0 && guildData.settings["profession-roles"] && !message.member.roles.find(r => r.name.toLowerCase() === userData.profession.toLowerCase())) {
    if (message.member.roles.find(r => ["professor", "auror", "magizoologist"].includes(r.name.toLowerCase()))) {
      message.member.removeRole(message.member.roles.find(r => ["professor", "auror", "magizoologist"].includes(r.name.toLowerCase()))).catch(err => console.error(err));
    }

    let role = message.guild.roles.find(r => r.name.toLowerCase() === userData.profession.toLowerCase());
    if (!role) {
      await message.guild.createRole({
        name: userData.profession.toLowerCase()
      }).then(newRole => role = newRole);
    }

    message.member.addRole(role).catch(err => console.error(err));

  }

  let users = await bot.userInfo.findAll({
    where: {
      guild: message.guild.id
    }
  });

  if (users.find(u => !message.guild.members.get(u.user))) {
    users = users.filter(u => !message.guild.members.get(u.user));
    users.forEach(user => {
      bot.userInfo.delete(bot, user, message.guild);
    });
  }

  if (!message.content.startsWith(guildData.settings.prefix)) return;

  const args = message.content.toLowerCase().slice(guildData.settings.prefix.length).split(/ +/);
  const commandName = args.shift();
  const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command || guildData.disabledCommands.includes(command.name)) return;

  command.execute(message, args, bot);
  bot.logger.log("info", `${message.member.displayName} (${message.author.id}) used the ${guildData.settings.prefix}${command.name} ${args.join(" ")} command in the channel ${message.channel.name} (${message.channel.id}) at ${moment().tz("America/Los_Angeles").format("LLLL")} in the guild ${message.guild.name} (${message.guild.id})`);
};
