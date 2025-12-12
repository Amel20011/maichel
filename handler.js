const { getContentType } = require("@whiskeysockets/baileys");
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const chalk = require('chalk');

// Import modul
const menu = require('./libs/menu');
const store = require('./libs/store');
const owner = require('./libs/owner');
const payment = require('./libs/payment');
const admin = require('./libs/admin');
const group = require('./libs/group');
const utils = require('./libs/utils');

async function handler(sock, msg, store, config) {
    try {
        const from = msg.key.remoteJid;
        const type = getContentType(msg.message);
        const isGroup = from.endsWith('@g.us');
        const sender = msg.key.participant || from;
        const pushname = msg.pushName || 'User';
        const body = type === 'conversation' ? msg.message.conversation : 
                     (type === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : '');
        
        // Log pesan
        console.log(chalk.cyan(`[${moment().format('HH:mm:ss')}] ${isGroup ? 'Grup' : 'PV'} ${pushname}: ${body || type}`));
        
        // Handle button response
        if (type === 'buttonsResponseMessage') {
            const selectedButtonId = msg.message.buttonsResponseMessage.selectedButtonId;
            const context = msg.message.buttonsResponseMessage.contextInfo;
            
            if (selectedButtonId === 'verify_account') {
                const verified = config.registerUser(sender, pushname);
                if (verified) {
                    await sock.sendMessage(from, {
                        text: `✅ *Verifikasi Berhasil!*\n\nHalo ${pushname}, akun Anda telah berhasil diverifikasi.\n\nSekarang Anda dapat menggunakan bot ini. Ketik *.menu* untuk melihat daftar perintah.`,
                        buttons: [
                            { buttonId: 'menu_button', buttonText: { displayText: '📋 Buka Menu' }, type: 1 },
                            { buttonId: 'store_button', buttonText: { displayText: '🛍️ Lihat Produk' }, type: 1 }
                        ]
                    });
                }
            } else if (selectedButtonId === 'menu_button') {
                await menu.sendMainMenu(sock, from, config);
            } else if (selectedButtonId === 'store_button') {
                await store.showProducts(sock, from, config);
            } else if (selectedButtonId === 'owner_button') {
                await owner.contactOwner(sock, from, config);
            } else if (selectedButtonId === 'group_button') {
                await group.joinGroup(sock, from, config);
            }
            return;
        }
        
        // Cek apakah pengguna sudah terdaftar
        if (!config.isRegistered(sender) && !body.startsWith(config.prefix + 'register')) {
            // Kirim button verifikasi untuk pengguna baru
            await sock.sendMessage(from, {
                text: `🔐 *Verifikasi Diperlukan*\n\nHalo ${pushname}, Anda perlu verifikasi terlebih dahulu untuk menggunakan bot ini.\n\nKlik tombol di bawah untuk verifikasi:`,
                buttons: [
                    { buttonId: 'verify_account', buttonText: { displayText: '✅ Verify My Account' }, type: 1 }
                ],
                footer: 'Liviaa Astranica Bot',
                headerType: 1
            });
            return;
        }
        
        // Handle command dengan prefix
        if (body && body.startsWith(config.prefix)) {
            const command = body.slice(config.prefix.length).trim().split(' ')[0].toLowerCase();
            const args = body.slice(config.prefix.length + command.length).trim();
            
            console.log(chalk.yellow(`Command: ${command}, Args: ${args}`));
            
            // Main Menu Commands
            if (command === 'menu' || command === 'help') {
                await menu.sendMainMenu(sock, from, config);
            } else if (command === 'allmenu') {
                await menu.sendAllMenu(sock, from, config);
            } else if (command === 'owner') {
                await owner.contactOwner(sock, from, config);
            } else if (command === 'donate') {
                await sock.sendMessage(from, { text: '💝 *Donasi*\n\nJika Anda ingin mendukung pengembangan bot ini, silahkan hubungi owner.' });
            } else if (command === 'runtime') {
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                await sock.sendMessage(from, { 
                    text: `⏱️ *Runtime*\n\nBot telah aktif selama:\n${hours} jam ${minutes} menit ${seconds} detik` 
                });
            } else if (command === 'ping') {
                const start = Date.now();
                await sock.sendMessage(from, { text: '🏓 Pong!' });
                const latency = Date.now() - start;
                await sock.sendMessage(from, { 
                    text: `🏓 *Pong!*\n\nLatency: ${latency}ms\nServer: ${process.uptime().toFixed(2)}s` 
                });
            } else if (command === 'profile') {
                await utils.showProfile(sock, from, sender, config);
            } else if (command === 'limit') {
                const users = config.loadUsers();
                const user = users.find(u => u.jid === sender);
                await sock.sendMessage(from, { 
                    text: `🎫 *Limit Anda*\n\nSisa limit: ${user ? user.limit : 0}\n\nLimit digunakan untuk menggunakan fitur-fitur bot.` 
                });
            } else if (command === 'saldo') {
                const users = config.loadUsers();
                const user = users.find(u => u.jid === sender);
                await sock.sendMessage(from, { 
                    text: `💰 *Saldo Anda*\n\nSaldo: Rp ${user ? user.balance.toLocaleString() : 0}\n\nGunakan *.topup* untuk menambah saldo.` 
                });
            } else if (command === 'topup') {
                await payment.showTopupMethods(sock, from, config);
            } else if (command === 'claim') {
                // Reset limit harian
                const users = config.loadUsers();
                const user = users.find(u => u.jid === sender);
                if (user) {
                    const lastClaim = user.lastClaim ? new Date(user.lastClaim) : new Date(0);
                    const now = new Date();
                    if (now.getDate() !== lastClaim.getDate()) {
                        user.limit += 20;
                        user.lastClaim = now.toISOString();
                        config.saveUsers(users);
                        await sock.sendMessage(from, { 
                            text: `🎁 *Claim Berhasil!*\n\nAnda mendapatkan 20 limit tambahan!\n\nLimit sekarang: ${user.limit}` 
                        });
                    } else {
                        await sock.sendMessage(from, { 
                            text: `⏳ *Claim Gagal*\n\nAnda sudah melakukan claim hari ini.\nSilahkan kembali besok.` 
                        });
                    }
                }
            }
            
            // Store Commands
            else if (command === 'store' || command === 'toko') {
                await store.showProducts(sock, from, config);
            } else if (command === 'product' || command === 'produk') {
                await store.showProductDetails(sock, from, args, config);
            } else if (command === 'cart' || command === 'keranjang') {
                await store.showCart(sock, from, sender, config);
            } else if (command === 'addcart') {
                await store.addToCart(sock, from, sender, args, config);
            } else if (command === 'removecart') {
                await store.removeFromCart(sock, from, sender, args, config);
            } else if (command === 'checkout') {
                await payment.processCheckout(sock, from, sender, config);
            } else if (command === 'order' || command === 'pesanan') {
                await store.showOrders(sock, from, sender, config);
            } else if (command === 'pay' || command === 'bayar') {
                await payment.showPaymentMethods(sock, from, config);
            } else if (command === 'qris') {
                await payment.showQRIS(sock, from, config);
            }
            
            // Group Commands
            else if (isGroup && (command === 'add' || command === 'tambah')) {
                await group.addMember(sock, from, args, config);
            } else if (isGroup && command === 'kick') {
                await group.kickMember(sock, from, args, config);
            } else if (isGroup && command === 'promote') {
                await group.promoteMember(sock, from, args, config);
            } else if (isGroup && command === 'demote') {
                await group.demoteMember(sock, from, args, config);
            } else if (isGroup && command === 'hidetag') {
                await group.hiddenTag(sock, from, args, config);
            } else if (isGroup && command === 'tagall') {
                await group.tagAll(sock, from, config);
            } else if (isGroup && (command === 'welcome' || command === 'selamatdatang')) {
                await group.toggleWelcome(sock, from, args, config);
            } else if (isGroup && command === 'antilink') {
                await group.toggleAntilink(sock, from, args, config);
            } else if (isGroup && command === 'antivirtex') {
                await group.toggleAntivirtex(sock, from, args, config);
            } else if (isGroup && command === 'antidelete') {
                await group.toggleAntidelete(sock, from, args, config);
            } else if (isGroup && (command === 'group' || command === 'grup')) {
                await group.toggleGroup(sock, from, args, config);
            } else if (isGroup && command === 'setppgc') {
                await group.setGroupProfile(sock, from, msg, config);
            } else if (isGroup && command === 'setnamegc') {
                await group.setGroupName(sock, from, args, config);
            } else if (isGroup && command === 'setdescgc') {
                await group.setGroupDescription(sock, from, args, config);
            } else if (isGroup && command === 'linkgc') {
                await group.getGroupLink(sock, from, config);
            } else if (isGroup && command === 'resetlinkgc') {
                await group.resetGroupLink(sock, from, config);
            } else if (isGroup && command === 'kickme') {
                await group.kickMe(sock, from, sender, config);
            } else if (isGroup && command === 'vote') {
                await group.createVote(sock, from, args, config);
            } else if (isGroup && command === 'devote') {
                await group.deleteVote(sock, from, config);
            }
            
            // Owner/Admin Commands
            else if (config.isOwner(sender) || config.isAdmin(sender)) {
                if (command === 'addprem') {
                    await admin.addPremium(sock, from, args, config);
                } else if (command === 'delprem') {
                    await admin.removePremium(sock, from, args, config);
                } else if (command === 'setprefix') {
                    await admin.setPrefix(sock, from, args, config);
                } else if (command === 'broadcast') {
                    await admin.broadcast(sock, from, args, config);
                } else if (command === 'addlimit') {
                    await admin.addLimit(sock, from, args, config);
                } else if (command === 'addsaldo') {
                    await admin.addBalance(sock, from, args, config);
                } else if (command === 'addproduct') {
                    await admin.addProduct(sock, from, args, config);
                } else if (command === 'delproduct') {
                    await admin.removeProduct(sock, from, args, config);
                } else if (command === 'listorder') {
                    await admin.listOrders(sock, from, config);
                } else if (command === 'confirmorder') {
                    await admin.confirmOrder(sock, from, args, config);
                } else if (command === 'cancelorder') {
                    await admin.cancelOrder(sock, from, args, config);
                }
            }
            
            // Downloader Commands
            else if (command === 'ytmp3') {
                await utils.downloadYoutubeMP3(sock, from, args, config);
            } else if (command === 'ytmp4') {
                await utils.downloadYoutubeMP4(sock, from, args, config);
            } else if (command === 'tiktok') {
                await utils.downloadTikTok(sock, from, args, config);
            } else if (command === 'igdl') {
                await utils.downloadInstagram(sock, from, args, config);
            } else if (command === 'fbdl') {
                await utils.downloadFacebook(sock, from, args, config);
            }
            
            // Jika command tidak dikenali
            else {
                await sock.sendMessage(from, { 
                    text: `❌ *Command Tidak Dikenali*\n\nGunakan *.menu* untuk melihat daftar command yang tersedia.` 
                });
            }
        }
        
        // Handle pesan lain (bukan command)
        else if (body) {
            // Cek antilink di grup
            if (isGroup) {
                const groupSettings = config.loadGroupSettings(from);
                if (groupSettings.antilink && (body.includes('http://') || body.includes('https://'))) {
                    await sock.sendMessage(from, { 
                        text: `⚠️ *Link Terdeteksi!*\n\n@${sender.split('@')[0]}, mengirim link tidak diizinkan di grup ini.`,
                        mentions: [sender]
                    });
                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                    return;
                }
            }
        }
        
    } catch (error) {
        console.error(chalk.red('Handler Error:'), error);
        try {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ *Terjadi Kesalahan*\n\nMohon maaf, terjadi kesalahan saat memproses permintaan Anda.' 
            });
        } catch (e) {
            console.error('Gagal mengirim pesan error:', e);
        }
    }
}

module.exports = handler;
