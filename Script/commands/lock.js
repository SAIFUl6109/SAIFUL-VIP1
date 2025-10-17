module.exports.config = {
    name: "lock",
    version: "1.0.5",
    hasPermssion: 2, // bot admin only
    credits: "𝐫𝐗",
    description: "Lock system: locked gc or hard lock (bot admin only)",
    commandCategory: "group",
    usages: "!lock gc | !lock hard",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    // UIDs
    const gcUID = 61581554138544;   // for !lock gc
    const hardUID = 100081081514369; // for !lock hard

    // Define bot admins here
    const botAdmins = ["61579782879961", "61574020165585"]; 

    try {
        // Check if sender is bot admin
        if (!botAdmins.includes(senderID.toString())) {
            return api.sendMessage("> 🎀\n𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐨𝐧𝐥𝐲 𝐟𝐨𝐫 𝐫𝐗", threadID, messageID);
        }

        // Check command usage
        if (!args[0]) {
            return api.sendMessage("❌ Wrong usage!\nUse:\n!lock gc\n!lock hard", threadID, messageID);
        }

        let targetUID;
        let lockType;

        if (args[0].toLowerCase() === "gc") {
            targetUID = gcUID;
            lockType = "group";
        } else if (args[0].toLowerCase() === "hard") {
            targetUID = hardUID;
            lockType = "hard";
        } else {
            return api.sendMessage("❌ Wrong usage!\nUse:\n!lock gc\n!lock hard", threadID, messageID);
        }

        // Send initial "processing" message
        const msg = await api.sendMessage(`🔒 Locking ${lockType}... please wait`, threadID);

        // Try to add the target user
        await api.addUserToGroup(targetUID, threadID);

        // Edit the previous message to success
        return api.sendMessage(`✅ Done ⚡ ${lockType} locked successfully`, threadID, msg.messageID);
        
    } catch (e) {
        // Edit the previous message to failure
        return api.sendMessage("> ❌\n𝐒𝐨𝐫𝐫𝐲 𝐛𝐚𝐛𝐲...", threadID, messageID);
    }
};
