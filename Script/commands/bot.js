const axios = require("axios");
const fs = global.nodemodule["fs-extra"];

const apiJsonURL = "https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json";

module.exports.config = {
  name: "obot",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "𝐫𝐗",
  description: "Maria Baby-style reply system (only exact 'bot' trigger)",
  commandCategory: "noprefix",
  usages: "bot",
  cooldowns: 3
};

// RX API fetch function
async function getRxAPI() {
  try {
    const res = await axios.get(apiJsonURL);
    if (res.data && res.data.rx) return res.data.rx;
    throw new Error("rx key not found in JSON");
  } catch (err) {
    console.error("Failed to fetch rx API:", err.message);
    return null;
  }
}

module.exports.handleEvent = async function({ api, event, Users }) {
  const { threadID, messageID, body, senderID, messageReply } = event;
  if (!body) return;

  const name = await Users.getNameUser(senderID);

  // ---- "bot" trigger: send frame + mention ----
  if (body.trim().toLowerCase() === "bot") {
    const replies = [
      "বেশি Bot Bot করলে leave নিবো কিন্তু😒",
      "🥛-🍍👈 -লে খাহ্..!😒",
      "শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নাই🥺",
      "আমি আবাল দের সাথে কথা বলি না😒",
      "এতো ডেকো না, প্রেমে পরে যাবো 🙈",
      "বার বার ডাকলে মাথা গরম হয়ে যায়😑",
      "হ্যা বলো😒, তোমার জন্য কি করতে পারি?",
      "এতো ডাকছিস কেন? গালি শুনবি নাকি? 🤬"
    ];
    const randReply = replies[Math.floor(Math.random() * replies.length)];

    const message =
`╭──────•◈•──────╮
   Hᴇʏ Xᴀɴ I’ᴍ Mᴀʀɪᴀ Bᴀʙʏ✨   

 ❄ Dᴇᴀʀ, ${name}
 💌 ${randReply}

╰──────•◈•──────╯`;

    // Send message with hidden marker (invisible to user)
    return api.sendMessage(
      { body: message, metadata: { rxbotsystem: true } },
      threadID,
      messageID
    );
  }

  // ---- Reply to bot message only ----
  if (
    messageReply &&
    messageReply.senderID === api.getCurrentUserID() &&
    messageReply.metadata?.rxbotsystem // check hidden marker
  ) {
    const replyText = body.trim();
    if (!replyText) return;

    const rxAPI = await getRxAPI();
    if (!rxAPI) return api.sendMessage("❌ Failed to load RX API.", threadID, messageID);

    try {
      const res = await axios.get(`${rxAPI}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(name)}`);
      const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

      for (const reply of responses) {
        await new Promise(resolve => {
          api.sendMessage(reply, threadID, (err) => {
            resolve();
          }, messageID);
        });
      }
    } catch (err) {
      console.error(err);
      return api.sendMessage(`| Error in RX API: ${err.message}`, threadID, messageID);
    }
  }
};

module.exports.run = function() {};
