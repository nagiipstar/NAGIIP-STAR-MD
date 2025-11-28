const axios = require('axios');

async function obfuscateCommand(sock, chatId, message, args) {
    try {
        const code = args.trim();
        
        if (!code) {
            await sock.sendMessage(chatId, {
                text: `╭━━━━━━━━━━━━━━━━━━╮
│  🔒 *CODE OBFUSCATOR*  │
╰━━━━━━━━━━━━━━━━━━╯

*Usage:* .obfuscate <JavaScript code>

*Example:*
.obfuscate function hello() { console.log("Hello World"); }

*Description:*
Obfuscates your JavaScript code to make it harder to read and understand while maintaining functionality.

*Note:* This command uses encryption to protect your code.`
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { text: '⏳ Obfuscating your code...' }, { quoted: message });

        const apiUrl = `https://api.princetechn.com/api/tools/encrypt?apikey=prince&code=${encodeURIComponent(code)}`;
        
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.encrypted_code) {
            const obfuscatedCode = response.data.encrypted_code;
            
            await sock.sendMessage(chatId, {
                text: `╭━━━━━━━━━━━━━━━━━━╮
│  ✅ *CODE OBFUSCATED*  │
╰━━━━━━━━━━━━━━━━━━╯

\`\`\`javascript
${obfuscatedCode}
\`\`\`

_Your JavaScript code has been successfully obfuscated!_`
            }, { quoted: message });
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Obfuscate command error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ *Error obfuscating code!*\n\nPlease check:\n• Your code syntax is correct\n• The code is JavaScript\n• Try with a simpler code snippet first'
        }, { quoted: message });
    }
}

module.exports = obfuscateCommand;
