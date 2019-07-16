const Discord = require("discord.js");

module.exports = {
  name: "get-code",
  description: "View a user's friend code.",
  aliases: ["gc", "friend-code", "fc"],
  async execute(message, args, bot) {
    let member = message.mentions.members.first() || message.guild.members.get(args[0]) || message.guild.members.find(u => u.displayName.toLowerCase().includes(args.join(" ")));
    if (!args[0]) member = message.member;

    const memberData = await bot.userInfo.get(bot, member.user, message.guild);
    if (!memberData || memberData.friendCode.length <= 0) return message.channel.send(`${member.displayName} has not set their friend code yet.`);

    message.channel.send(chunk(memberData.friendCode, 4).join(" "));

    function chunk(str, n) {
      const ret = [];
      let i;
      let len;

      for (i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n));
      }

      return ret;
    }
  },
};
