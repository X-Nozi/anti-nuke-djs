module.exports.run = async (client, message, args) => {
  if (
    message.author.id === "168372724488470528" ||
    message.member.id === message.guild.ownerID
  ) {
    try {
      await message.author
        .send(`Pinging...`)
        .then(msg => msg.edit(`Pong! \`${client.ws.ping}ms\``));
    } catch (err) {
      throw err;
    }
  }
};
module.exports.config = {
  name: "ping",
  aliases: [],
  description: `Check the bots response time to discord.`,
  usage: `ping`
};
