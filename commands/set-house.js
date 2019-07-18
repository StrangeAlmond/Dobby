const Discord = require("discord.js");

module.exports = {
  name: "set-house",
  description: "Set your house.",
  aliases: ["sethouse"],
  async execute(message, args, bot) {
    const usersData = await bot.userInfo.get(bot, message.author, message.guild);
    const guild = await bot.guildInfo.get(bot, message.guild);

    const houses = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"];

    if (!args[0] || !houses.includes(args[0])) return message.channel.send(`Specify the house you'd like to set your house to! \`${guild.settings.prefix}set-house <slytherin/gryffindor/hufflepuff/ravenclaw>\``);

    const house = args[0];
    usersData.house = house;
    await bot.userInfo.update({
      house: usersData.house
    }, {
      where: {
        user: message.author.id
      }
    });

    const guilds = bot.guilds.filter(g => g.members.get(message.author.id));

    guilds.forEach(async g => {
      const guildData = await bot.guildInfo.get(bot, g);
      if (!guildData) return;
      if (!guildData.settings["house-roles"]) return;

      const member = g.members.get(message.author.id);
      let houseRole = g.roles.find(r => r.name.toLowerCase() === house);

      if (!houseRole) {
        houseRole = await message.guild.createRole({
          name: house
        }).catch(err => console.error(err));
      }

      if (member.roles.find(r => houses.includes(r.name.toLowerCase()))) await member.removeRole(member.roles.find(r => houses.includes(r.name.toLowerCase()))).catch(err => console.error(err));

      member.addRole(houseRole).catch(err => console.error(err));
    });

    message.channel.send(`Got it! Your house has been set to **${house}**`);
  },
};
