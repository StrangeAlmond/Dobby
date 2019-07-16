const Discord = require("discord.js");

module.exports = {
  name: "set-profession",
  description: "Set your profession",
  aliases: ["setprofession"],
  async execute(message, args, bot) {
    const professions = ["auror", "magizoologist", "professor"];
    if (!professions.includes(args[0])) return message.channel.send("Invalid Profession.");

    const userData = await bot.userInfo.get(bot, message.author, message.guild);
    const professionChosen = args[0];

    if (userData.profession === professionChosen) return message.channel.send(`You are already in the ${professionChosen.charAt(0).toUpperCase() + professionChosen.slice(1)} profession!`);

    const guilds = bot.guilds.filter(g => g.members.find(u => u.id === message.author.id));

    guilds.forEach(async guild => {
      const guildData = await bot.guildInfo.get(bot, guild);
      const member = guild.members.find(u => u.id === message.author.id);

      if (!guildData) return;

      if (guildData.settings["profession-roles"]) {
        if (!guild.roles.find(r => r.name.toLowerCase() === professionChosen)) {
          await guild.createRole({
            name: professionChosen
          }).catch(err => console.error(err));
        }
      }

      if (member.roles.find(r => professions.includes(r.name.toLowerCase()))) member.removeRole(member.roles.find(r => professions.includes(r.name.toLowerCase())).id);

      const professionRole = guild.roles.find(r => r.name.toLowerCase() === professionChosen);
      member.addRole(professionRole.id).catch(err => console.error(err));
    });

    userData.profession = professionChosen;
    await bot.userInfo.update({
      profession: userData.profession
    }, {
      where: {
        user: message.author.id
      }
    });

    message.channel.send(`Got it! I have added ${message.member} to the ${professionChosen} profession!`);
  },
};
