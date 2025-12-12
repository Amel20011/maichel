const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require("@whiskeysockets/baileys");
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const qrcode = require('qrcode-terminal');

// Import handler dan config
const handler = require('./handler');
const config = require('./config');

// Buat store untuk menyimpan data sementara
const store = makeInMemoryStore({});
store.readFromFile('./baileys_store.json');

// Simpan store secara berkala
setInterval(() => {
    store.writeToFile('./baileys_store.json');
}, 10_000);

async function startBot() {
    // Auth state
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    
    // Versi WA
    const { version } = await fetchLatestBaileysVersion();
    
    // Buat socket
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['Liviaa Astranica', 'Chrome', '1.0.0'],
        generateHighQualityLinkPreview: true,
    });
    
    // Simpan credentials
    sock.ev.on('creds.update', saveCreds);
    
    // Simpan store ke socket
    store.bind(sock.ev);
    
    // Event connection update
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log(chalk.yellow('Scan QR Code di atas untuk login!'));
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red('Koneksi terputus, menghubungkan ulang...', lastDisconnect.error));
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log(chalk.green('✅ Bot berhasil terhubung!'));
            console.log(chalk.cyan(`🤖 Bot: ${sock.user.name}`));
            
            // Update config dengan nomor bot
            config.botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            // Kirim pesan ke owner
            if (config.ownerNumber) {
                sock.sendMessage(config.ownerNumber, { 
                    text: `✅ *Liviaa Astranica Bot Aktif!*\n\nBot telah berhasil terhubung ke WhatsApp.\nWaktu: ${new Date().toLocaleString()}` 
                });
            }
        }
    });
    
    // Event messages upsert
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        try {
            await handler(sock, msg, store, config);
        } catch (error) {
            console.error(chalk.red('Error handling message:'), error);
        }
    });
    
    // Event messages reaction
    sock.ev.on('messages.reaction', async (reaction) => {
        console.log('Reaction received:', reaction);
    });
    
    // Event group participants update
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        
        // Handle welcome message
        if (action === 'add') {
            const group = await store.fetchGroupMetadata(id, sock);
            const memberCount = participants.length;
            
            for (const participant of participants) {
                // Cek apakah bot yang ditambahkan
                if (participant === sock.user.id) {
                    sock.sendMessage(id, { 
                        text: `Terima kasih telah menambahkan saya di grup ini! 🤖\n\nGunakan *.menu* untuk melihat daftar perintah.` 
                    });
                } else {
                    // Welcome message untuk member baru
                    const welcomeConfig = config.loadGroupSettings(id);
                    if (welcomeConfig.welcome) {
                        const welcomeMsg = config.welcomeMessage
                            .replace('@user', `@${participant.split('@')[0]}`)
                            .replace('@group', group.subject)
                            .replace('@membercount', memberCount);
                        
                        sock.sendMessage(id, { 
                            text: welcomeMsg,
                            mentions: [participant]
                        });
                    }
                }
            }
        }
        
        // Handle goodbye message
        if (action === 'remove') {
            const group = await store.fetchGroupMetadata(id, sock);
            for (const participant of participants) {
                const goodbyeConfig = config.loadGroupSettings(id);
                if (goodbyeConfig.goodbye) {
                    const goodbyeMsg = config.goodbyeMessage
                        .replace('@user', `@${participant.split('@')[0]}`)
                        .replace('@group', group.subject);
                    
                    sock.sendMessage(id, { 
                        text: goodbyeMsg,
                        mentions: [participant]
                    });
                }
            }
        }
    });
    
    return sock;
}

// Jalankan bot
startBot().catch(console.error);

// Handle error yang tidak tertangkap
process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught Exception:'), error);
});

process.on('unhandledRejection', (error) => {
    console.error(chalk.red('Unhandled Rejection:'), error);
});
