const { MessageEmbed } = require("discord.js");
const colour = { mainColour: "" };
const emojis = require("../util/emojis.json");
let prefix = `.`;

exports.run = async (bot, message, args) => {
  if (
    message.author.id === "168372724488470528" ||
    message.member.id === message.guild.ownerID
  ) {
    let embed = new MessageEmbed()
      .setColor(colour.mainColour)
      .addField(
        `Commands`,
        `${prefix}whitelist [user] - Whitelist a user\n${prefix}blacklist [user] - Removes a user from whitelist\n${prefix}list - List all whitelisted users.\n${prefix}rrmsg - Spawn the reaction role message\n${prefix}set [game] [role] - Set reaction role roles.\n${prefix}ping - Check the bots response time to discord.`
      )
      .setFooter(`${prefix}help <command>`)
      .setTimestamp();
    try {
      message.author.send(embed);
    } catch (err) {
      message.reply(`Your DMs are off.`);
    }
  }
};
module.exports.config = {
  name: "help",
  aliases: ["h", "commands", "cmds"],
  description: "Shows a list of commands.",
  usage: `help`
};
