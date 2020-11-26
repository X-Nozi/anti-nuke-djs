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
        whitelists.findOne(
          { guild: message.guild.id, id: member.id },
          async function(err, client) {
            if (!client) {
              const newWhiteList = new whitelists({
                guild: message.guild.id,
                user: member.user.tag,
                id: member.id
              });
              newWhiteList.save().catch(err => console.log(`[ERROR] ${err}`));
              await message.channel.send(
                new MessageEmbed()
                  .setColor(mainColour)
                  .setDescription(
                    `${emojis.success} **<@${member.id}> is now whitelisted**`
                  )
              );
            } else {
              message.channel.send(
                new MessageEmbed()
                  .setColor(mainColour)
                  .setDescription(
                    `${emojis.fail} **<@${member.id}> is already whitelisted.**`
                  )
              );
            }
          }
        );
      }
      if (!member)
        return message.channel.send(
          new MessageEmbed()
            .setColor(mainColour)
            .setDescription(
              `${emojis.fail} It doesn't look like you mentioned a user.`
            )
        );
    } catch (err) {
      console.log(err);
    }
  }
  if (message.member.id === message.guild.ownerID) command();
};
module.exports.config = {
  name: "whitelist",
  aliases: ["wl"],
  description: `Whitelist a user.`,
  usage: `whitelist [usertelist [user]`
};
