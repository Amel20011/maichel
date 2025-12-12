const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');

class Utils {
    async showProfile(sock, from, sender, config) {
        try {
            const users = config.loadUsers();
            const user = users.find(u => u.jid === sender);
            
            if (!user) {
                await sock.sendMessage(from, { 
                    text: '❌ *Profil Tidak Ditemukan*\n\nSilahkan verifikasi akun Anda terlebih dahulu.' 
                });
                return;
            }
            
            const profileText = `👤 *PROFIL ANDA*\n\n` +
                               `*Nama:* ${user.name || 'Tidak ada'}\n` +
                               `*Status:* ${user.verified ? '✅ Terverifikasi' : '❌ Belum diverifikasi'}\n` +
                               `*Saldo:* Rp ${user.balance ? user.balance.toLocaleString() : '0'}\n` +
                               `*Limit:* ${user.limit || 0}\n` +
                               `*Terdaftar:* ${new Date(user.registeredAt).toLocaleDateString()}\n` +
                               `*Total Order:* ${user.orders ? user.orders.length : 0}`;
            
            await sock.sendMessage(from, { text: profileText });
        } catch (error) {
            console.error(chalk.red('Profile Error:'), error);
            throw error;
        }
    }

    async downloadYoutubeMP3(sock, from, args, config) {
        try {
            const url = args.trim();
            if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
                await sock.sendMessage(from, { 
                    text: '❌ *URL Tidak Valid*\n\nPastikan URL dari YouTube.' 
                });
                return;
            }
            
            await sock.sendMessage(from, { 
                text: '⏳ *Sedang Mengunduh...*\n\nMP3 dari YouTube sedang diunduh. Mohon tunggu.' 
            });
            
            // Implementasi download YouTube MP3
            // Note: Anda perlu menambahkan library seperti ytdl-core dan fluent-ffmpeg
            
            await sock.sendMessage(from, { 
                text: '✅ *Fitur YouTube MP3*\n\nFitur ini dalam pengembangan.' 
            });
        } catch (error) {
            console.error(chalk.red('YouTube MP3 Error:'), error);
            throw error;
        }
    }

    async downloadYoutubeMP4(sock, from, args, config) {
        try {
            const url = args.trim();
            if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
                await sock.sendMessage(from, { 
                    text: '❌ *URL Tidak Valid*\n\nPastikan URL dari YouTube.' 
                });
                return;
            }
            
            await sock.sendMessage(from, { 
                text: '✅ *Fitur YouTube MP4*\n\nFitur ini dalam pengembangan.' 
            });
        } catch (error) {
            console.error(chalk.red('YouTube MP4 Error:'), error);
            throw error;
        }
    }

    async downloadTikTok(sock, from, args, config) {
        try {
            const url = args.trim();
            if (!url.includes('tiktok.com')) {
                await sock.sendMessage(from, { 
                    text: '❌ *URL Tidak Valid*\n\nPastikan URL dari TikTok.' 
                });
                return;
            }
            
            await sock.sendMessage(from, { 
                text: '✅ *Fitur TikTok Downloader*\n\nFitur ini dalam pengembangan.' 
            });
        } catch (error) {
            console.error(chalk.red('TikTok Error:'), error);
            throw error;
        }
    }

    async downloadInstagram(sock, from, args, config) {
        try {
            const url = args.trim();
            if (!url.includes('instagram.com')) {
                await sock.sendMessage(from, { 
                    text: '❌ *URL Tidak Valid*\n\nPastikan URL dari Instagram.' 
                });
                return;
            }
            
            await sock.sendMessage(from, { 
                text: '✅ *Fitur Instagram Downloader*\n\nFitur ini dalam pengembangan.' 
            });
        } catch (error) {
            console.error(chalk.red('Instagram Error:'), error);
            throw error;
        }
    }

    async downloadFacebook(sock, from, args, config) {
        try {
            const url = args.trim();
            if (!url.includes('facebook.com')) {
                await sock.sendMessage(from, { 
                    text: '❌ *URL Tidak Valid*\n\nPastikan URL dari Facebook.' 
                });
                return;
            }
            
            await sock.sendMessage(from, { 
                text: '✅ *Fitur Facebook Downloader*\n\nFitur ini dalam pengembangan.' 
            });
        } catch (error) {
            console.error(chalk.red('Facebook Error:'), error);
            throw error;
        }
    }
}

module.exports = new Utils();
