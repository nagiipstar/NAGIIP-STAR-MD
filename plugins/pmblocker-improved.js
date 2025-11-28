/**
 * Improved PM Blocker Command
 * Enhanced with better UI and management
 */

const fs = require('fs');

const PMBLOCKER_PATH = './data/pmblocker.json';

function readState() {
    try {
        if (!fs.existsSync(PMBLOCKER_PATH)) {
            return { 
                enabled: false, 
                message: '⚠️ *Private Messages Blocked!*\n\n📛 I cannot accept direct messages right now.\nPlease contact the owner in group chats only.\n\n_Automated by Nagiip Star MD_',
                whitelist: []
            };
        }
        const raw = fs.readFileSync(PMBLOCKER_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return {
            enabled: !!data.enabled,
            message: data.message || '⚠️ *Private Messages Blocked!*\n\n📛 I cannot accept direct messages right now.\nPlease contact the owner in group chats only.\n\n_Automated by Nagiip Star MD_',
            whitelist: data.whitelist || []
        };
    } catch {
        return { 
            enabled: false, 
            message: '⚠️ *Private Messages Blocked!*\n\n📛 I cannot accept direct messages right now.\nPlease contact the owner in group chats only.\n\n_Automated by Nagiip Star MD_',
            whitelist: []
        };
    }
}

function writeState(enabled, message, whitelist) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        const current = readState();
        const payload = {
            enabled: enabled !== undefined ? !!enabled : current.enabled,
            message: message || current.message,
            whitelist: whitelist || current.whitelist
        };
        fs.writeFileSync(PMBLOCKER_PATH, JSON.stringify(payload, null, 2));
    } catch (e) {
        console.error('Error writing pmblocker state:', e);
    }
}

async function pmblockerCommand(sock, chatId, message, args) {
    const argStr = (args || '').trim();
    const parts = argStr.split(' ');
    const sub = parts[0]?.toLowerCase();
    const state = readState();

    const helpText = `╭━━━━━━━━━━━━━━━━━━╮
│   🔒 *PM BLOCKER*   │
╰━━━━━━━━━━━━━━━━━━╯

*Commands:*
┌─────────────────
│ .pmblocker on
├ Enable PM blocking
│
│ .pmblocker off
├ Disable PM blocking
│
│ .pmblocker setmsg <text>
├ Set custom warning message
│
│ .pmblocker whitelist @user
├ Add user to whitelist (reply)
│
│ .pmblocker unwhitelist @user
├ Remove from whitelist (reply)
│
│ .pmblocker status
├ Show current settings
└─────────────────

*Current Status:*
• Enabled: ${state.enabled ? '✅ ON' : '❌ OFF'}
• Whitelisted: ${state.whitelist.length} user(s)
• Message: ${state.message.substring(0, 40)}...`;

    if (!sub || !['on', 'off', 'status', 'setmsg', 'whitelist', 'unwhitelist'].includes(sub)) {
        await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
        return;
    }

    if (sub === 'status') {
        let whitelistText = '';
        if (state.whitelist.length > 0) {
            whitelistText = '\n\n*Whitelisted Users:*\n';
            state.whitelist.forEach((jid, i) => {
                whitelistText += `${i + 1}. @${jid.split('@')[0]}\n`;
            });
        }
        await sock.sendMessage(chatId, { 
            text: helpText + whitelistText,
            mentions: state.whitelist
        }, { quoted: message });
        return;
    }

    if (sub === 'setmsg') {
        const newMsg = parts.slice(1).join(' ').trim();
        if (!newMsg) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .pmblocker setmsg <message>' }, { quoted: message });
            return;
        }
        writeState(state.enabled, newMsg, state.whitelist);
        await sock.sendMessage(chatId, { text: `✅ PM Blocker message updated!\n\n*New message:*\n${newMsg}` }, { quoted: message });
        return;
    }

    if (sub === 'whitelist' || sub === 'unwhitelist') {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo;
        const targetJid = quotedMsg?.participant || quotedMsg?.remoteJid;

        if (!targetJid || targetJid.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ Please reply to a user message!' }, { quoted: message });
        }

        let newWhitelist = [...state.whitelist];
        
        if (sub === 'whitelist') {
            if (newWhitelist.includes(targetJid)) {
                return await sock.sendMessage(chatId, { 
                    text: `✅ @${targetJid.split('@')[0]} is already whitelisted!`,
                    mentions: [targetJid]
                }, { quoted: message });
            }
            newWhitelist.push(targetJid);
            writeState(state.enabled, state.message, newWhitelist);
            await sock.sendMessage(chatId, { 
                text: `✅ Added @${targetJid.split('@')[0]} to whitelist!\nThey can now DM even when PM blocker is enabled.`,
                mentions: [targetJid]
            }, { quoted: message });
        } else {
            newWhitelist = newWhitelist.filter(jid => jid !== targetJid);
            writeState(state.enabled, state.message, newWhitelist);
            await sock.sendMessage(chatId, { 
                text: `✅ Removed @${targetJid.split('@')[0]} from whitelist!`,
                mentions: [targetJid]
            }, { quoted: message });
        }
        return;
    }

    const enable = sub === 'on';
    writeState(enable, state.message, state.whitelist);
    
    const icon = enable ? '✅' : '❌';
    await sock.sendMessage(chatId, { 
        text: `${icon} PM Blocker is now *${enable ? 'ENABLED' : 'DISABLED'}*!\n\n${enable ? '🔒 Direct messages will be blocked (except whitelisted users)' : '🔓 Direct messages are now allowed'}` 
    }, { quoted: message });
}

module.exports = { pmblockerCommand, readState };
