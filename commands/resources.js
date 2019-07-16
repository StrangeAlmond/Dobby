const Discord = require("discord.js");

module.exports = {
  name: "resources",
  description: "WU Resources.",
  async execute(message, args, bot) {
    const resourcesEmbed = new Discord.RichEmbed()
      .setAuthor("Harry Potter WU Resources", "https://pbs.twimg.com/profile_images/1062419828860837888/V0UaLtdN_400x400.jpg")
      .setDescription("[Wizards Unite Hub](https://wizardsunitehub.info/)\n[Accio WU](https://acciowizardsunite.com/)\n[Wizards Unite World](https://wizardsuniteworld.com/)\n[Harry Potter Wizards Unite Wiki - GamePress](https://wizardsunite.gamepress.gg/)")
      .setColor(message.guild.me.displayHexColor)
      .setTimestamp();
    message.channel.send(resourcesEmbed);
  },
};
