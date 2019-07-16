module.exports = {
  name: "restart",
  description: "Restarts the bot",
  async execute(message, args, bot) {
    if (message.author.id !== "356172624684122113") return;
    await message.channel.send("Restarting...");
    await process.exit();
  },
};
