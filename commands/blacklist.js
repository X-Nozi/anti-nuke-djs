const { mainColour } = { mainColour: "" };
const { MessageEmbed } = require("discord.js");
const whitelists = require("../database/whitelist.js");
const emojis = require("../util/emojis.json");
module.exports.run = async (client, message, args) => {
  async function command() {
    try {
      let member =
        message.mentions.members.first() ||
        message.guild.members.cache.find(u => u.id === args[0]);
      if (member) {
        await whitelists.findOneAndDelete(
          { guild: message.guild.id, id: member.id },
          function(err, guild) {
            if (!guild) {
              message.channel.send(
                new MessageEmbed()
                  .setColor(mainColour)
                  .setDescription(
                    `${emojis.fail} **${member} isn't in whitelisted.**`
                  )
              );
            } else {
              message.channel.send(
                new MessageEmbed()
                  .setColor(mainColour)
                  .setDescription(
                    `${emojis.success} **<@${member.id}> is no longer whitelisted.**`
                  )
              );
            }
          }
        );
      }
      if (!member) {
        message.channel.send(
          new MessageEmbed()
            .setColor(mainColour)
            .setDescription(
              `${emojis.fail} It doesn't look like you mentioned a user.`
            )
        );
      }
    } catch (err) {
      console.log(err);
    }
  }
  if (message.member.id === message.guild.ownerID) command();
};
module.exports.config = {
  name: "blacklist",
  aliases: ["bl"],
  description: `Blacklist a user.`,
  usage: `blacklist [user]`
};
