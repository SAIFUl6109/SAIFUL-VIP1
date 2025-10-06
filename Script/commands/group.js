const fs = require("fs");
const axios = require("axios");
const path = __dirname + "/cache/protect.json";

// Load saved GC protection info
let protectData = {};
if (fs.existsSync(path)) {
  protectData = JSON.parse(fs.readFileSync(path));
}

module.exports.config = {
  name: "group",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Manage your group: change name, emoji, image and protect them",
  commandCategory: "Box",
  usages: "!group name [name] | !group emoji [emoji] | !group image | !group set",
  cooldowns: 0,
  dependencies: []
};

module.exports.run = async ({ api, event, args, Users, Threads }) => {
  const subCommand = args[0] ? args[0].toLowerCase() : null;
  const threadID = event.threadID;

  // ------------------ Protect mode ------------------
  if (subCommand === "set") {
    // Get current group info
    const threadInfo = await api.getThreadInfo(threadID);
    const emoji = threadInfo.emoji;
    const name = threadInfo.threadName;

    // For image
    const imgPath = __dirname + "/cache/protect_" + threadID + ".png";
    const avatarUrl = threadInfo.imageSrc;
    if (avatarUrl) {
      const imgData = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(imgPath, Buffer.from(imgData, "utf-8"));
    }

    // Save protect data
    protectData[threadID] = { name, emoji, image: imgPath, protect: true };
    fs.writeFileSync(path, JSON.stringify(protectData, null, 2));

    return api.sendMessage("✅ Group protection is now ON! Name, Emoji, and Image will be restored if changed.", threadID, event.messageID);
  }

  // ------------------ Change name ------------------
  else if (subCommand === "name") {
    const name = args.slice(1).join(" ");
    if (!name) return api.sendMessage("❌ You have not entered the group name", threadID, event.messageID);
    api.setTitle(name, threadID, () => api.sendMessage(`🔨 The bot changed the group name to: ${name}`, threadID, event.messageID));
  }

  // ------------------ Change emoji ------------------
  else if (subCommand === "emoji") {
    const emoji = args.slice(1).join(" ");
    if (!emoji) return api.sendMessage("❌ You have not entered an emoji", threadID, event.messageID);
    api.changeThreadEmoji(emoji, threadID, () => api.sendMessage(`🔨 The bot successfully changed Emoji to: ${emoji}`, threadID, event.messageID));
  }

  // ------------------ Change image ------------------
  else if (subCommand === "image") {
    if (event.type !== "message_reply") return api.sendMessage("❌ You have to reply to a photo", threadID, event.messageID);
    if (!event.messageReply.attachments || event.messageReply.attachments.length === 0) return api.sendMessage("❌ You have to reply to a photo", threadID, event.messageID);
    if (event.messageReply.attachments.length > 1) return api.sendMessage("❌ Please reply only 1 photo!", threadID, event.messageID);

    const photoUrl = event.messageReply.attachments[0].url;
    const pathImg = __dirname + "/cache/group.png";
    const getdata = (await axios.get(photoUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(getdata, "utf-8"));

    return api.changeGroupImage(fs.createReadStream(pathImg), threadID, () => fs.unlinkSync(pathImg), event.messageID);
  }

  // ------------------ Unknown subcommand ------------------
  else return api.sendMessage("❌ Unknown subcommand. Use: name, emoji, image, or set", threadID, event.messageID);
};

// ------------------ Event listener to auto-restore ------------------
module.exports.handleEvent = async ({ api, event }) => {
  const threadID = event.threadID;
  if (!protectData[threadID] || !protectData[threadID].protect) return;

  // Ignore if sender is admin
  const threadInfo = await api.getThreadInfo(threadID);
  if (threadInfo.adminIDs.some(ad => ad.id === event.senderID)) return;

  const { name, emoji, image } = protectData[threadID];

  // Restore name
  if (event.logMessageType === "log:thread-name") {
    api.setTitle(name, threadID);
  }
  // Restore emoji
  if (event.logMessageType === "log:thread-emoji") {
    api.changeThreadEmoji(emoji, threadID);
  }
  // Restore image
  if (event.logMessageType === "log:thread-icon") {
    if (fs.existsSync(image)) api.changeGroupImage(fs.createReadStream(image), threadID);
  }
};
