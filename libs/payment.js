const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class Payment {
    async showPaymentMethods(sock, from, config) {
        try {
            const paymentText = `💳 *METODE PEMBAYARAN*

*1. QRIS (Recommended)*
   - Scan QR code untuk pembayaran
   - Support semua bank & e-wallet
   - Otomatis terverifikasi

*2. Transfer Bank*
   - BCA: 1234567890 (Liviaa Astranica)
   - BRI: 0987654321 (Liviaa Astranica)
   - Mandiri: 1122334455 (Liviaa Astranica)

*3. E-Wallet*
   - OVO: 081234567890
   - Dana: 081234567890
   - Gopay: 081234567890

*Instruksi:*
1. Lakukan pembayaran
2. Kirim bukti transfer ke owner
3. Pesanan akan diproses

Ketik ${config.prefix}qris untuk mendapatkan QRIS`;

            await sock.sendMessage(from, { text: paymentText });
        } catch (error) {
            console.error(chalk.red('Payment Error:'), error);
            throw error;
        }
    }

    async showQRIS(sock, from, config) {
        try {
            // Kirim gambar QRIS (gunakan URL atau path file lokal)
            const qrisImage = config.settings.qrisImage;
            
            await sock.sendMessage(from, {
                image: { url: qrisImage },
                caption: `📱 *QRIS PAYMENT*\n\nScan QR code di atas untuk pembayaran.\n\n*Nominal:* Sesuai total pembayaran\n*Validasi:* Otomatis\n\nSetelah pembayaran, kirim bukti ke owner.`
            });
        } catch (error) {
            console.error(chalk.red('QRIS Error:'), error);
            throw error;
        }
    }

    async showTopupMethods(sock, from, config) {
        try {
            const topupText = `💰 *TOPUP SALDO*

*Metode Topup:*
1. Transfer Bank
2. QRIS
3. E-Wallet

*Minimal Topup:* Rp 10,000
*Maksimal Topup:* Rp 1,000,000

*Instruksi:*
1. Pilih metode pembayaran
2. Lakukan pembayaran
3. Kirim bukti ke owner
4. Saldo akan ditambahkan dalam 5 menit

Untuk topup, silahkan hubungi owner langsung.`;

            await sock.sendMessage(from, {
                text: topupText,
                buttons: [
                    {
                        buttonId: 'contact_owner',
                        buttonText: { 
                            displayText: '💬 Hubungi Owner' 
                        },
                        type: 1
                    }
                ]
            });
        } catch (error) {
            console.error(chalk.red('Topup Error:'), error);
            throw error;
        }
    }

    async processCheckout(sock, from, sender, config) {
        try {
            const carts = config.loadCarts();
            const userCart = carts[sender] || [];
            
            if (userCart.length === 0) {
                await sock.sendMessage(from, { 
                    text: '❌ *Keranjang Kosong*\n\nTambahkan produk terlebih dahulu.' 
                });
                return;
            }
            
            // Hitung total
            let total = 0;
            userCart.forEach(item => {
                total += item.price * item.quantity;
            });
            
            // Generate order ID
            const orderId = 'ORD' + Date.now().toString().slice(-8);
            
            // Simpan order
            const orders = config.loadOrders();
            orders.push({
                id: orderId,
                buyer: sender,
                items: [...userCart],
                total: total,
                date: new Date().toISOString(),
                status: 'pending_payment'
            });
            config.saveOrders(orders);
            
            // Kosongkan cart
            carts[sender] = [];
            config.saveCarts(carts);
            
            const orderText = `✅ *CHECKOUT BERHASIL*\n\n` +
                             `*Order ID:* ${orderId}\n` +
                             `*Total:* Rp ${total.toLocaleString()}\n` +
                             `*Status:* Menunggu Pembayaran\n\n` +
                             `Silahkan lakukan pembayaran menggunakan metode yang tersedia.\n` +
                             `Ketik ${config.prefix}pay untuk melihat metode pembayaran.`;
            
            await sock.sendMessage(from, { 
                text: orderText,
                buttons: [
                    { buttonId: 'pay_button', buttonText: { displayText: '💳 Bayar Sekarang' }, type: 1 },
                    { buttonId: 'qris_button', buttonText: { displayText: '📱 QRIS Payment' }, type: 1 }
                ]
            });
            
            // Notify owner
            await sock.sendMessage(config.ownerNumber, {
                text: `📦 *ORDER BARU*\n\n` +
                     `Order ID: ${orderId}\n` +
                     `Pembeli: ${sender}\n` +
                     `Total: Rp ${total.toLocaleString()}\n` +
                     `Status: Pending Payment`
            });
        } catch (error) {
            console.error(chalk.red('Checkout Error:'), error);
            throw error;
        }
    }
}

module.exports = new Payment();
