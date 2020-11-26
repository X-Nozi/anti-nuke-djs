const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
const client = new Discord.Client({
  disableEveryone: true,
  disabledEvents: [
    "GUILD_MEMBER_REMOVE",
    "GUILD_UPDATE",
    "GUILD_MEMBERS_CHUNK",
    "GUILD_ROLE_CREATE",
    "GUILD_EMOJIS_UPDATE",
    "GUILD_INTEGRATIONS_UPDATE",
    "CHANNEL_CREATE",
    "CHANNEL_UPDATE",
    "CHANNEL_PINS_UPDATE",
    "MESSAGE_DELETE_BULK",
    "USER_UPDATE",
    "PRESENCE_UPDATE",
    "TYPING_START",
    "VOICE_STATE_UPDATE",
    "VOICE_SERVER_UPDATE",
    "WEBHOOKS_UPDATE"
  ],
  fetchAllMembers: false
});
const { token, connurl } = require("./util/config.json");
client.login(token);
mongoose.connect(
  connurl,
  { useUnifiedTopology: true, useNewUrlParser },
  err => {
    if (err) return console.log(err);
    else console.log("[INFO] Connected to the database.");
  }
);
client.commands = new Discord.Collection();
fs.readdir("./Commands", (err, files) => {
  if (err) console.error(err);
  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if (jsfiles.length <= 0) {
    console.log("[INFO] No commands found to load.");
    return;
  }
  console.log(`[INFO] Loading ${jsfiles.length} commands.`);
  jsfiles.forEach((f, i) => {
    let props = require(`./Commands/${f}`);
    console.log(`[INFO] ${i + 1}: ${f} loaded.`);
    client.commands.set(props.config.name, props);
    if (props.config.aliases) {
      props.config.aliases.forEach(alias => {
        client.commands.set(alias, props);
      });
    }
  });
});

const { MessageEmbed } = require("discord.js");
const whitelists = require("./database/whitelist.js");
let config = { quarantine: ``, mainColour: ``, mainRole: ``, prefix: "." };
const banAddAntiNuke = new Map();
const channelDeleteAntiNuke = new Map();
const roleDeleteAntiNuke = new Map();

client.on("guildBanAdd", async (guild, user) => {
  let audit = await client.guilds.cache
    .get(guild.id)
    .fetchAuditLogs({ type: 12 });
  let entry = audit.entries.first();
  async function AntiNuke() {
    let entry_chnldel = banAddAntiNuke.get(entry.executor.id);
    if (!entry_chnldel) {
      banAddAntiNuke.set(entry.executor.id, 1);
    } else {
      banAddAntiNuke.set(entry.executor.id, entry_chnldel + 1);
    }
    if (entry_chnldel >= 4) {
      let antinukequery = { successful: "", unsuccessful: "" };
      let member = await guild.members.cache.get(entry.executor.id);
      if (member.user.bot) {
        member.roles.cache.forEach(async role => {
          if (role.managed) {
            try {
              await role.setPermissions(0);
              antinukequery.successful += `+ Successfully removed permissions from the bot.\n`;
            } catch (Err) {
              antinukequery.unsuccessful +=
                "- Error removing permissions from the bot.\n";
              console.log(Err);
            }
          }
        });
      }
      let roles = [];
      member.roles.cache.forEach(r => {
        if (r.id != guild.id) roles.push(r.name);
      });
      try {
        await member.roles.set([quarantine]);
        antinukequery.successful += `+ Successfully removed all roles and quarantined.\n`;
      } catch (err) {
        antinukequery.unsuccessful +=
          "- Error removing all roles and quarantining.\n";
      }
      banAddAntiNuke.delete(entry.executor.id);
      let antinukequery = { successful: "", unsuccessful: "" };
      let antinukembed = new MessageEmbed()
        .setAuthor(
          entry.executor.tag,
          entry.executor.displayAvatarURL({ format: "png", dyanmic: true })
        )
        .setDescription(
          `<@${entry.executor.id || "Unknown"}> (${entry.executor.tag ||
            "Unknown"}) has triggered **ban add** anti nuke.`
        )
        .addField(
          `Successful Operations`,
          `\`\`\`diff\n${antinukequery.successful || "- None"}\`\`\``
        )
        .addField(
          `Unsuccessful Operations`,
          `\`\`\`diff\n${antinukequery.unsuccessful || "+ None"}\`\`\``
        )
        .addField(
          `Roles`,
          `${roles.length >= 1 ? roles.join(", ") : "No Roles."}`
        )
        .setColor(mainColour)
        .setFooter(`Potential Nuker ID: ${entry.executor.id || "Unknown"}`);
      log(antinukembed);
    }
    setTimeout(() => {
      banAddAntiNuke.delete(entry.executor.id);
    }, 60000);
  }
  if (!(await whitelists.findOne({ guild: guild.id, id: entry.executor.id })))
    AntiNuke();
});

client.on("channelDelete", async channel => {
  let audit = await client.guilds.cache
    .get(channel.guild.id)
    .fetchAuditLogs({ type: 12 });
  let entry = audit.entries.first();
  async function AntiNuke() {
    let entry_chnldel = channelDeleteAntiNuke.get(entry.executor.id);
    if (!entry_chnldel) {
      channelDeleteAntiNuke.set(entry.executor.id, 1);
    } else {
      channelDeleteAntiNuke.set(entry.executor.id, entry_chnldel + 1);
    }
    if (entry_chnldel >= 2) {
      let roles = [];
      let member = await channel.guild.members.cache.get(entry.executor.id);
      if (member.user.bot)
        member.roles.cache.forEach(async role => {
          if (role.managed) {
            try {
              await role.setPermissions(0);
            } catch (Err) {
              console.log(Err);
            }
          }
        });
      try {
        await member.roles.set([config.quarantine]);
      } catch (err) {
        console.error();
      }
      channelDeleteAntiNuke.delete(entry.executor.id);
      let antinukembed = new MessageEmbed()
        .setAuthor(
          entry.executor.tag,
          entry.executor.displayAvatarURL({ format: "png", dyanmic: true })
        )
        .setDescription(
          `<@${entry.executor.id || "Unknown"}> (${entry.executor.tag ||
            "Unknown"}) has triggered **channel delete** anti nuke.`
        )
        .addField(
          `Roles`,
          `${roles.length >= 1 ? roles.join(", ") : "No Roles."}`
        )
        .setColor(config.mainColour)
        .setFooter(`Potential Nuker ID: ${entry.executor.id || "Unknown"}`);
      log(antinukembed);
    }
    setTimeout(() => {
      channelDeleteAntiNuke.delete(entry.executor.id);
    }, 60000);
  }
  if (
    !(await whitelists.findOne({
      guild: channel.guild.id,
      id: entry.executor.id
    }))
  )
    AntiNuke();
});

client.on("roleDelete", async role => {
  let audit = await client.guilds.cache
    .get(role.guild.id)
    .fetchAuditLogs({ type: 12 });
  let entry = audit.entries.first();
  if (
    !(await whitelists.findOne({ guild: role.guild.id, id: entry.executor.id }))
  )
    AntiNuke();
  async function AntiNuke() {
    if (role.id === config.mainRole)
      return triggeredAntiNuke(`${role.name} role`);
    let entry_chnldel = roleDeleteAntiNuke.get(entry.executor.id);
    if (!entry_chnldel) {
      roleDeleteAntiNuke.set(entry.executor.id, 1);
    } else {
      roleDeleteAntiNuke.set(entry.executor.id, entry_chnldel + 1);
    }
    if (entry_chnldel >= 2) triggeredAntiNuke("role");
    setTimeout(() => {
      roleDeleteAntiNuke.delete(entry.executor.id);
    }, 60000);
  }
  async function triggeredAntiNuke(cause) {
    let antinukequery = { successful: "", unsuccessful: "" };
    let member = await role.guild.members.cache.get(entry.executor.id);
    if (member.user.bot) {
      member.roles.cache.forEach(async role => {
        if (role.managed) {
          try {
            await role.setPermissions(0);
            antinukequery.successful += `+ Successfully removed permissions from the bot.\n`;
          } catch (Err) {
            antinukequery.unsuccessful +=
              "- Error removing permissions from the bot.\n";
            console.log(Err);
          }
        }
      });
    }
    let roles = [];
    member.roles.cache.forEach(r => {
      if (r.id != role.guild.id) roles.push(r.name);
    });
    try {
      await member.roles.set([quarantine]);
      antinukequery.successful += `+ Successfully removed all roles and quarantined.\n`;
    } catch (err) {
      antinukequery.unsuccessful +=
        "- Error removing all roles and quarantining.\n";
    }
    roleDeleteAntiNuke.delete(entry.executor.id);
    let antinukembed = new MessageEmbed()
      .setAuthor(
        entry.executor.tag,
        entry.executor.displayAvatarURL({ format: "png", dyanmic: true })
      )
      .setDescription(
        `<@${entry.executor.id || "Unknown"}> (${entry.executor.tag ||
          "Unknown"}) has triggered **${cause} delete** anti nuke.`
      )
      .addField(
        `Successful Operations`,
        `\`\`\`diff\n${antinukequery.successful || "- None"}\`\`\``
      )
      .addField(
        `Unsuccessful Operations`,
        `\`\`\`diff\n${antinukequery.unsuccessful || "+ None"}\`\`\``
      )
      .addField(
        `Roles`,
        `${roles.length >= 1 ? roles.join(", ") : "No Roles."}`
      )
      .setColor(mainColour)
      .setFooter(`Potential Nuker ID: ${entry.executor.id || "Unknown"}`);
    log(antinukembed);
  }
});

client.on("message", async message => {
  if (message.channel.type === "dm" || message.author.bot) return;
  let messageArray = message.content.toLowerCase().split(" ");
  let command = messageArray[0];
  let args = messageArray.slice(1);
  if (!command.startsWith(config.prefix)) return;
  let cmd = client.commands.get(command.slice(config.prefix.length));
  if (cmd) cmd.run(client, message, args);
});

async function log(message) {
  let lc = await client.channels.cache.find(chl => chl.name === "anti-nuke");
  if (lc) lc.send(message);
  if (management)
    guild.roles.cache.get(management).members.forEach(member => {
      member.send(message).catch(err => console.log(err));
    });
}
