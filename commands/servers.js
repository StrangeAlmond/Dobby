const Discord = require("discord.js");

module.exports = {
  name: "servers",
  description: "Get a list of servers",
  aliases: ["listservers", "serverlist"],
  async execute(message, args, bot) {
    if (!args[0] || args[0] === "list") args[0] = 1;
    if (!isNaN(args[0])) {
      let guilds = await bot.guildInfo.findAll();
      guilds = guilds.filter(g => g.settings.listed);

      if (parseInt(args[0]) <= 0 || parseInt(args[0]) > Math.ceil(guilds.length / 5)) return message.channel.send("Invalid page!");

      const page = (parseInt(args[0]) - 1) * 5;
      const servers = guilds.splice(page, page + 5);

      const serversEmbed = new Discord.RichEmbed()
        .setAuthor(`Page ${args[0]}/${Math.ceil((guilds.length / 5) + 1)}`)
        .setColor(message.guild.me.displayHexColor);

      for (const server in servers) {
        const serverObject = await bot.guilds.get(servers[server].guild);
        const invites = await serverObject.fetchInvites().catch(err => console.error(err));

        let invite = invites.first();

        if (!invite) {
          invite = await serverObject.channels.find(c => c.permissionsFor(message.guild.me).toArray().includes("CREATE_INSTANT_INVITE")).createInvite({
            maxAge: 1800000
          }).catch(err => console.error(err));
        }

        const location = servers[server].location.location;
        serversEmbed.addField(serverObject.name, `**Invite URL:** ${invite.url}\n**Location:** ${location.length > 0 ? location : "Unknown"}`);
      }

      message.channel.send(serversEmbed);
    } else if (args[0]) {
      let guilds = await bot.guildInfo.findAll();
      guilds = guilds.filter(g => g.settings.listed);

      const searchResults = guilds.filter(g => bot.guilds.get(g.guild).name.toLowerCase().includes(args.join(" ")) || g.location.location.toLowerCase().includes(args.join(" ")));

      const searchEmbed = new Discord.RichEmbed()
        .setTitle("🔍 Server Search")
        .setColor(message.guild.me.displayHexColor);

      if (searchResults.length <= 0) return message.channel.send("No servers were found for this search.");

      for (const server in searchResults) {
        const serverObject = await bot.guilds.get(guilds[server].guild);
        const invites = await serverObject.fetchInvites();
        let invite = invites.first().url;

        if (!invites.first()) {
          invite = await serverObject.channels.first().createInvite({
            maxAge: 1800000
          });

          invite = invite.url;
        }

        searchEmbed.addField(serverObject.name, `**Invite URL:** ${invite}\n**Location:** ${searchResults[server].location.location}`, true);
      }

      message.channel.send(searchEmbed);
    }
  },
};
