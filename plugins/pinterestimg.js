const axios = require('axios');
const fetch = require('node-fetch');

async function pinterestImgCommand(sock, chatId, message) {
    try {
        const prompt = message.message?.conversation?.trim() || 
                      message.message?.extendedTextMessage?.text?.trim() || '';
        
        const searchQuery = prompt.slice(13).trim();
        
        if (!searchQuery) {
            await sock.sendMessage(chatId, {
                text: '❌ Please enter the name of the image you want.\nExample: .pinterestimg beautiful sunset'
            }, {
                quoted: message
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '📌 Searching Please wait....'
        }, {
            quoted: message
        });

        const apiUrl = `https://delirius-apiofc.vercel.app/search/pinterest?text=${encodeURIComponent(searchQuery)}`;
        const response = await axios.get(apiUrl);

        if (!response.data || !response.data.results || response.data.results.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Sawir lama helin. Fadlan isku day magac kale.'
            }, {
                quoted: message
            });
            return;
        }

        const imageUrls = response.data.results.slice(0, 5);
        let successCount = 0;

        for (let i = 0; i < imageUrls.length; i++) {
            try {
                const imageUrl = imageUrls[i];
                
                const imageResponse = await fetch(imageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    timeout: 10000
                });

                if (!imageResponse.ok) {
                    console.log(`Failed to download Pinterest image ${i + 1}`);
                    continue;
                }

                const imageBuffer = await imageResponse.buffer();

                await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption: `📌 Pinterest sawirka ${i + 1}/${imageUrls.length}: "${searchQuery}"`
                }, {
                    quoted: message
                });

                successCount++;
                
                if (i < imageUrls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (imgError) {
                console.error(`Error downloading Pinterest image ${i + 1}:`, imgError.message);
                continue;
            }
        }

        if (successCount === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Error Please try again....'
            }, {
                quoted: message
            });
        }

    } catch (error) {
        console.error('Error in pinterestimg command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error Please try again....'
        }, {
            quoted: message
        });
    }
}

module.exports = pinterestImgCommand;
