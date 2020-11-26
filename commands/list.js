const { mainColour } = { mainColour: "" };
const { MessageEmbed } = require("discord.js");
const whitelists = require("../database/whitelist.js");
const emojis = require("../util/emojis.json");
module.exports.run = async (client, message, args) => {
  async function command() {
    whitelists.find({ guild: message.guild.id }, function(err, guildID) {
      if (err) return console.log(err);
      let user = "";
      guildID.forEach(guild => {
        user += `${guild.user} - ${guild.id}\n`;
      });
      let embed = new MessageEmbed()
        .setColor(mainColour)
        .setAuthor(
          message.author.tag,
          message.author.displayAvatarURL({ format: "png", dyanmic: true })
        )
        .setTitle("Whitelisted Users");
      embed.setDescription(user.length ? `${user}` : "No users found.");
      message.channel.send(embed);
    });
  }
  if (
    message.author.id === "168372724488470528" ||
    message.member.id === message.guild.ownerID
  )
    command();
};
module.exports.config = {
  name: "list",
  aliases: [],
  description: `Get a list of whitelisted users.`,
  usage: `list`
};
