const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class Owner {
    async contactOwner(sock, from, config) {
        try {
            const ownerInfo = `👑 *INFORMASI OWNER*

*Nama:* Liviaa Astranica
*WhatsApp:* +1 (365) 870-0681
*Instagram:* @liviaastranica
*Toko:* Liviaa Astranica Store

*Jam Operasional:*
08:00 - 22:00 WIB

Klik tombol di bawah untuk menghubungi owner langsung:`;

            await sock.sendMessage(from, {
                text: ownerInfo,
                buttons: [
                    {
                        buttonId: 'contact_owner',
                        buttonText: { 
                            displayText: '📱 Hubungi Owner' 
                        },
                        type: 1
                    },
                    {
                        buttonId: 'group_button',
                        buttonText: { 
                            displayText: '👥 Join Grup' 
                        },
                        type: 1
                    }
                ],
                footer: config.botName,
                headerType: 1
            });
        } catch (error) {
            console.error(chalk.red('Owner Error:'), error);
            throw error;
        }
    }
}

module.exports = new Owner();
