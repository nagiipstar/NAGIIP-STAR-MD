const { fontStyles, loadFontSettings } = require('../lib/fontTransformer');
const fs = require('fs');
const path = require('path');

const settingsFile = path.join(__dirname, '../data/botFont.json');

function saveFontSettings(settings) {
    try {
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Error saving font settings:', error);
    }
}

function transformText(text, fontStyle) {
    const style = fontStyles[fontStyle] || fontStyles.default;
    return style.transform(text);
}

async function setbotfontCommand(sock, chatId, message, args, senderId, isSenderSudo) {
    if (!message.key.fromMe && !isSenderSudo) {
        await sock.sendMessage(chatId, {
            text: '🔒 *Access Denied!*\n\nOnly the bot owner can change font settings.'
        }, { quoted: message });
        return;
    }

    const fontArg = args[0]?.toLowerCase();

    if (!fontArg) {
        const settings = loadFontSettings();
        const currentFont = fontStyles[settings.currentFont]?.name || 'Default';
        
        await sock.sendMessage(chatId, {
            text: `╭──❍「 *FONT SETTINGS* 」❍
│ 
│ *Current Font:* ${currentFont}
│
│ *Available Fonts:*
│ ➤ default - Normal text
│ ➤ bold - 𝗕𝗼𝗹𝗱 𝘁𝗲𝘅𝘁
│ ➤ italic - 𝘐𝘵𝘢𝘭𝘪𝘤 𝘵𝘦𝘹𝘵
│ ➤ monospace - 𝚖𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎
│ ➤ fancy - 𝒻𝒶𝓃𝒸𝓎 𝓉𝑒𝓍𝓉
│ ➤ double - 𝕕𝕠𝕦𝕓𝕝𝕖 𝕤𝕥𝕣𝕦𝕔𝕜
│ ➤ sans - 𝗦𝗮𝗻𝘀
│ ➤ tiny - ᵗⁱⁿʸ
│ ➤ smallcaps - Sᴍᴀʟʟ Cᴀᴘs
│ ➤ serifitalic - 𝑆𝑒𝑟𝑖𝑓 𝐼𝑡𝑎𝑙𝑖𝑐
│ ➤ serifbold - 𝐒𝐞𝐫𝐢𝐟 𝐁𝐨𝐥𝐝
│ ➤ underline - u͟n͟d͟e͟r͟l͟i͟n͟e͟
│ ➤ strike - s̶t̶r̶i̶k̶e̶
│
│ *Usage:* .setbotfont <font>
│ *Example:* .setbotfont sans
│
╰─────────❍`
        }, { quoted: message });
        return;
    }

    if (!fontStyles[fontArg]) {
        await sock.sendMessage(chatId, {
            text: `❌ *Invalid Font!*\n\nAvailable fonts:\n• default\n• bold\n• italic\n• monospace\n• fancy\n• double\n• sans\n• tiny\n• smallcaps\n• serifitalic\n• serifbold\n• underline\n• strike\n\n*Example:* .setbotfont sans`
        }, { quoted: message });
        return;
    }

    try {
        const settings = loadFontSettings();
        settings.currentFont = fontArg;
        saveFontSettings(settings);

        const preview = transformText('Nagiip Star MD', fontArg);
        
        await sock.sendMessage(chatId, {
            text: `✅ *Font Updated!*\n\n*New Font:* ${fontStyles[fontArg].name}\n*Preview:* ${preview}\n\nBot responses will now use this font style.`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in setbotfont command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ *Error!*\n\nFailed to update font settings. Please try again.'
        }, { quoted: message });
    }
}

module.exports = { setbotfontCommand, transformText, loadFontSettings };
