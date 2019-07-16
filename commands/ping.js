module.exports = {
  name: "ping",
  description: "ping the bot",
  async execute(message, args, bot) {
    message.channel.send("Pinging...").then(msg => {
      msg.edit(`Pong! ${Math.floor(Date.now() - message.createdTimestamp)} ms`);
    });
  },
};
