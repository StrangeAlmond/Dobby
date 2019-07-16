const Discord = require("discord.js");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");

module.exports = {
  name: "planted",
  description: "Report a planted seed at a greenhouse",
  aliases: ["sprouting", "plant"],
  async execute(message, args, bot) {
    const guildData = await bot.guildInfo.get(bot, message.guild);

    if (!args[0]) return message.channel.send(`Specify the greenhouse's name! Proper Usage: \`${guildData.settings.prefix}planted <greenhouse name> <seed> <time remaining: hours:minutes (eg 3:25, 1:30,  24:00)>\``);
    if (!args[1]) return message.channel.send(`Specify the seed! Proper Usage: \`${guildData.settings.prefix}planted <greenhouse name> <seed> <time remaining: hours:minutes (eg 3:25, 1:30,  24:00)>\``);
    if (!args.slice(args.length - 1)[0]) return message.channel.send(`Specify the time remaining! Proper Usage: \`${guildData.settings.prefix}planted <greenhouse name> <seed> <time remaining: hours:minutes (eg 3:25, 1:30,  24:00)>\``);

    let seed = args.slice(args.length - 2, args.length - 1);
    let time = args[args.length - 1].match(/[0-2][0-9]:[0-5][0-9]|[0-9]:[0-5][0-9]|[0-2][0-9]:[0-9]|[0-2][0-9]:[0-9]|[0-9]:[0-9]/gim);

    const seeds = ["bitter root", "ginger root", "leaping toadstool", "lovage", "scurvygrass", "sneezewort", "snowdrop", "sopophorus bean", "valerian root", "wormwood"];
    seed = seeds.find(i => seed.some(ing => i.split(/ +/g).includes(ing)));

    let greenhouse;

    if (seed.split(/ +/g).length === 2) {
      greenhouse = args.slice(0, args.length - 3);
    } else if (seed.split(/ +/g).length === 1) {
      greenhouse = args.slice(0, args.length - 2);
    }

    if (!seed) return message.channel.send(`Specify the seed! Proper Usage: \`${guildData.settings.prefix}planted <greenhouse name> <seed> <time remaining: hours:minutes (eg 3:25, 1:30,  24:00)>\``);
    if (!time) return message.channel.send(`Specify the time remaining! Proper Usage: \`${guildData.settings.prefix}planted <greenhouse name> <seed> <time remaining: hours:minutes (eg 3:25, 1:30,  24:00)>\``);

    time = time[0].split(/:/g);

    if (time[0].startsWith("0")) time[0] = time[0].slice(1);
    if (time[1].startsWith("0")) time[1] = time[1].slice(1);

    const hours = parseInt(time[0]);
    const minutes = parseInt(time[1]);

    time = moment().add(hours, "hours").add(minutes, "minutes");
    if (Date.now() >= time.valueOf()) return message.channel.send(`Specify the time remaining! Proper Usage: \`${guildData.settings.prefix}planted <greenhouse name> <seed> <time remaining: hours:minutes (eg 3:25, 1:30,  24:00)>\``);

    let unknownLocation = true;

    const object = {
      greenhouse: greenhouse.join(" "),
      seed: seed,
      time: time.valueOf(),
      channel: message.channel.id,
      message: message.id,
      users: [],
      sprouted: false
    };

    if (guildData.planted.find(p => p.greenhouse === greenhouse.join(" "))) return message.channel.send("Someone has already reported that greenhouse!");

    let directions = [`https://www.google.com/maps/search/${greenhouse.join("+")}${guildData.location.location.length > 0 ? `+${guildData.location.location.split(/ +/g).join("+")}` : ""}`, `http://maps.apple.com/?q=SEARCH${greenhouse.join("+")}${guildData.location.location.length > 0 ? `+${guildData.location.location.split(/ +/g).join("+")}` : ""}`, `http://waze.to/?q=${greenhouse.join("+")}${guildData.location.location.length > 0 ? `+${guildData.location.location.split(/ +/g).join("+")}` : ""}`];
    if (guildData.poi.some(p => greenhouse.join(" ").includes(p.name.toLowerCase()) || p.aliases.some(a => greenhouse.join(" ").includes(a.toLowerCase())))) {
      const poi = guildData.poi.find(p => greenhouse.join(" ").includes(p.name.toLowerCase()) || p.aliases.some(a => greenhouse.join(" ").includes(a.toLowerCase())));
      unknownLocation = false;
      directions = [`https://www.google.com/maps/place/${poi.latitude},${poi.longitude}`, `http://maps.apple.com/?daddr=${poi.latitude},${poi.longitude}`, `http://waze.to/?ll=${poi.latitude},${poi.longitude}`];
    }

    object.unknownLocation = unknownLocation;

    const greenhouseEmbed = new Discord.RichEmbed()
      .setAuthor(`${message.member.displayName} has planted a ${seed} seed!`, message.author.displayAvatarURL)
      .setDescription(`It will sprout **in ${hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""} and ` : ""}${minutes} minute${minutes > 1 ? "s" : ""}${guildData.location.coordinates.length > 0 ? ` (${moment(time.valueOf()).tz(tzlookup(guildData.location.coordinates.split(/, /g)[0], guildData.location.coordinates.split(/, /g)[1])).format("h:mm a")})` : ""}**, React with ✅ if you would like to be notified when this seed sprouts.`)
      .addField("Directions", `[Google Maps](${directions[0]}), [Apple Maps](${directions[1]}), [Waze](${directions[2]})${unknownLocation ? " (Unknown location, these directions may be incorrect.)" : ""}`)
      .setColor(message.guild.me.displayHexColor)
      .setTimestamp();
    const msg = await message.channel.send(greenhouseEmbed);

    msg.react("✅");
    object.message = msg.id;

    guildData.planted.push(object);
    bot.guildInfo.set(bot, {
      planted: guildData.planted
    }, message.guild);
  },
};
