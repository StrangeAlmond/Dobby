// Requirements
const Discord = require("discord.js");
const bot = new Discord.Client({
  disabledEvents: ["TYPING_START"]
});

const botconfig = require("./botconfig.json");
const fs = require("fs");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(botconfig.sequelize.db, botconfig.sequelize.user, botconfig.sequelize.password, {
  host: "localhost",
  dialect: "postgres",
  logging: false
});

bot.userInfo = sequelize.define("users", {
  user: Sequelize.STRING,
  guild: Sequelize.STRING,
  reports: Sequelize.ARRAY(Sequelize.JSON),
  badges: Sequelize.ARRAY(Sequelize.JSON),
  ign: Sequelize.STRING,
  title: Sequelize.STRING,
  house: Sequelize.STRING,
  level: Sequelize.INTEGER,
  xp: Sequelize.INTEGER,
  stats: Sequelize.JSON,
  profession: Sequelize.STRING,
  friendCode: Sequelize.STRING
});

bot.guildInfo = sequelize.define("guilds", {
  guild: {
    type: Sequelize.STRING,
    unique: true
  },
  poi: Sequelize.ARRAY(Sequelize.JSON),
  reports: Sequelize.ARRAY(Sequelize.JSON),
  badges: Sequelize.ARRAY(Sequelize.JSON),
  disabledCommands: Sequelize.ARRAY(Sequelize.STRING),
  settings: Sequelize.JSON,
  location: Sequelize.JSON,
  planted: Sequelize.ARRAY(Sequelize.JSON),
  welcomeMessage: Sequelize.JSON
});

const winston = require("winston");
bot.logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs"
    }),
  ],
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

// Command and Event Handler
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  const eventName = file.split(".")[0];

  bot.on(eventName, event.bind(null, bot));
  delete require.cache[require.resolve(`./events/${file}`)];
}

// Debugging
process.on("unhandledRejection", error => console.error("Uncaught Promise Rejection", error));

// log into the bot
bot.login(botconfig.token);
