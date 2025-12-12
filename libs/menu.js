const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class Menu {
    async sendMainMenu(sock, from, config) {
        try {
            const menuText = `🤖 *${config.botName} - Main Menu*

┌───〔 🌟 MAIN MENU 〕
│ • ${config.prefix}menu
│ • ${config.prefix}owner
│ • ${config.prefix}donate
│ • ${config.prefix}runtime
│ • ${config.prefix}ping 
│ • ${config.prefix}profile
│ • ${config.prefix}limit
│ • ${config.prefix}saldo
│ • ${config.prefix}topup
│ • ${config.prefix}claim
│ • ${config.prefix}store
│ • ${config.prefix}cart
│ • ${config.prefix}order

┌───〔 🛍️ STORE MENU 〕
│ • ${config.prefix}store
│ • ${config.prefix}product [id]
│ • ${config.prefix}addcart [id] [qty]
│ • ${config.prefix}cart
│ • ${config.prefix}removecart [id]
│ • ${config.prefix}checkout
│ • ${config.prefix}pay
│ • ${config.prefix}qris

┌───〔 💰 PAYMENT 〕
│ • ${config.prefix}topup
│ • ${config.prefix}pay
│ • ${config.prefix}qris

┌───〔 🎬 DOWNLOADER 〕
│ • ${config.prefix}ytmp3 [link]
│ • ${config.prefix}ytmp4 [link]
│ • ${config.prefix}tiktok [link]
│ • ${config.prefix}igdl [link]
│ • ${config.prefix}fbdl [link]

┌───〔 📱 SOSMED 〕
│ • Instagram: @liviaastranica
│ • YouTube: Liviaa Astranica
│ • TikTok: @liviaastranica

Ketik ${config.prefix}allmenu untuk melihat semua command!`;

            await sock.sendMessage(from, {
                text: menuText,
                buttons: [
                    { buttonId: 'store_button', buttonText: { displayText: '🛍️ Lihat Store' }, type: 1 },
                    { buttonId: 'owner_button', buttonText: { displayText: '👑 Hubungi Owner' }, type: 1 },
                    { buttonId: 'group_button', buttonText: { displayText: '👥 Join Grup' }, type: 1 }
                ],
                footer: config.botName,
                headerType: 1
            });
        } catch (error) {
            console.error(chalk.red('Menu Error:'), error);
            throw error;
        }
    }

    async sendAllMenu(sock, from, config) {
        try {
            const allMenuText = `🤖 *${config.botName} - All Commands*

┌───〔 🌟 MAIN MENU 〕
│ • ${config.prefix}menu
│ • ${config.prefix}owner
│ • ${config.prefix}donate
│ • ${config.prefix}runtime
│ • ${config.prefix}ping 
│ • ${config.prefix}profile
│ • ${config.prefix}limit
│ • ${config.prefix}saldo
│ • ${config.prefix}topup
│ • ${config.prefix}claim
│ • ${config.prefix}addprem @tag
│ • ${config.prefix}delprem @tag
│ • ${config.prefix}setprefix
│ • ${config.prefix}broadcast
│ • ${config.prefix}addlimit
│ • ${config.prefix}addsaldo
│ • ${config.prefix}ytmp3 link
│ • ${config.prefix}ytmp4 link
│ • ${config.prefix}tiktok link
│ • ${config.prefix}igdl link
│ • ${config.prefix}fbdl link

┌───〔 🛍️ STORE MENU 〕
│ • ${config.prefix}store
│ • ${config.prefix}product [id]
│ • ${config.prefix}addcart [id] [qty]
│ • ${config.prefix}cart
│ • ${config.prefix}removecart [id]
│ • ${config.prefix}checkout
│ • ${config.prefix}pay
│ • ${config.prefix}qris

┌───〔 👥 GROUP MENU 〕
│ • ${config.prefix}add @tag
│ • ${config.prefix}kick @tag
│ • ${config.prefix}promote @tag
│ • ${config.prefix}demote @tag
│ • ${config.prefix}hidetag teks
│ • ${config.prefix}tagall
│ • ${config.prefix}welcome on/off
│ • ${config.prefix}antilink on/off
│ • ${config.prefix}antivirtex on/off
│ • ${config.prefix}antidelete on/off
│ • ${config.prefix}group buka/tutup
│ • ${config.prefix}setppgc (reply foto)
│ • ${config.prefix}setnamegc teks
│ • ${config.prefix}setdescgc teks
│ • ${config.prefix}linkgc
│ • ${config.prefix}resetlinkgc
│ • ${config.prefix}kickme
│ • ${config.prefix}vote teks
│ • ${config.prefix}devote

┌───〔 👑 OWNER MENU 〕
│ • ${config.prefix}addproduct [nama] [harga] [stok]
│ • ${config.prefix}delproduct [id]
│ • ${config.prefix}listorder
│ • ${config.prefix}confirmorder [id]
│ • ${config.prefix}cancelorder [id]
│ • ${config.prefix}broadcast [pesan]
│ • ${config.prefix}addlimit @tag [jumlah]
│ • ${config.prefix}addsaldo @tag [jumlah]

*Note:*
- [] = wajib diisi
- () = opsional
- @tag = tag member
- Gunakan prefix "${config.prefix}" sebelum command`;

            await sock.sendMessage(from, { text: allMenuText });
        } catch (error) {
            console.error(chalk.red('All Menu Error:'), error);
            throw error;
        }
    }
}

module.exports = new Menu();
