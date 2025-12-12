const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class Admin {
    async addPremium(sock, from, args, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            // Implementasi add premium
            await sock.sendMessage(from, { 
                text: '✅ *Fitur Add Premium*\n\nFitur ini dalam pengembangan.' 
            });
        } catch (error) {
            console.error(chalk.red('Add Premium Error:'), error);
            throw error;
        }
    }

    async removePremium(sock, from, args, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            // Implementasi remove premium
            await sock.sendMessage(from, { 
                text: '✅ *Fitur Remove Premium*\n\nFitur ini dalam pengembangan.' 
            });
        } catch (error) {
            console.error(chalk.red('Remove Premium Error:'), error);
            throw error;
        }
    }

    async setPrefix(sock, from, args, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            if (!args) {
                await sock.sendMessage(from, { 
                    text: '❌ *Format Salah*\n\nGunakan: .setprefix [prefix]\nContoh: .setprefix !' 
                });
                return;
            }
            
            config.prefix = args;
            config.settings.prefix = args;
            config.saveSettings();
            
            await sock.sendMessage(from, { 
                text: `✅ *Prefix Diubah*\n\nPrefix berhasil diubah menjadi: ${args}` 
            });
        } catch (error) {
            console.error(chalk.red('Set Prefix Error:'), error);
            throw error;
        }
    }

    async broadcast(sock, from, args, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            if (!args) {
                await sock.sendMessage(from, { 
                    text: '❌ *Format Salah*\n\nGunakan: .broadcast [pesan]' 
                });
                return;
            }
            
            const users = config.loadUsers();
            let success = 0;
            let failed = 0;
            
            for (const user of users) {
                try {
                    await sock.sendMessage(user.jid, { 
                        text: `📢 *BROADCAST*\n\n${args}\n\n_Pesan ini dikirim ke semua pengguna bot._` 
                    });
                    success++;
                } catch (error) {
                    failed++;
                }
            }
            
            await sock.sendMessage(from, { 
                text: `✅ *Broadcast Selesai*\n\nBerhasil: ${success}\nGagal: ${failed}` 
            });
        } catch (error) {
            console.error(chalk.red('Broadcast Error:'), error);
            throw error;
        }
    }

    async addLimit(sock, from, args, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            // Implementasi add limit
            await sock.sendMessage(from, { 
                text: '✅ *Fitur Add Limit*\n\nFitur ini dalam pengembangan.' 
            });
        } catch (error) {
            console.error(chalk.red('Add Limit Error:'), error);
            throw error;
        }
    }

    async addBalance(sock, from, args, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            // Implementasi add balance
            await sock.sendMessage(from, { 
                text: '✅ *Fitur Add Balance*\n\nFitur ini dalam pengembangan.' 
            });
        } catch (error) {
            console.error(chalk.red('Add Balance Error:'), error);
            throw error;
        }
    }

    async addProduct(sock, from, args, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            const parts = args.split('|');
            if (parts.length < 3) {
                await sock.sendMessage(from, { 
                    text: '❌ *Format Salah*\n\nGunakan: .addproduct [nama]|[harga]|[stok]|[deskripsi?]\nContoh: .addproduct Baju|50000|10|Baju keren' 
                });
                return;
            }
            
            const name = parts[0].trim();
            const price = parseInt(parts[1].trim());
            const stock = parseInt(parts[2].trim());
            const description = parts[3] ? parts[3].trim() : '';
            
            if (!name || isNaN(price) || isNaN(stock)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Format Salah*\n\nNama, harga, dan stok harus valid.' 
                });
                return;
            }
            
            const products = config.loadProducts();
            const productId = 'PROD' + Date.now().toString().slice(-6);
            
            products.push({
                id: productId,
                name,
                price,
                stock,
                description,
                createdAt: new Date().toISOString()
            });
            
            config.saveProducts(products);
            
            await sock.sendMessage(from, { 
                text: `✅ *Produk Ditambahkan*\n\nID: ${productId}\nNama: ${name}\nHarga: Rp ${price.toLocaleString()}\nStok: ${stock}` 
            });
        } catch (error) {
            console.error(chalk.red('Add Product Error:'), error);
            throw error;
        }
    }

    async removeProduct(sock, from, args, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            const productId = args.trim();
            const products = config.loadProducts();
            const productIndex = products.findIndex(p => p.id === productId);
            
            if (productIndex === -1) {
                await sock.sendMessage(from, { 
                    text: '❌ *Produk Tidak Ditemukan*' 
                });
                return;
            }
            
            const removedProduct = products.splice(productIndex, 1)[0];
            config.saveProducts(products);
            
            await sock.sendMessage(from, { 
                text: `✅ *Produk Dihapus*\n\n${removedProduct.name} telah dihapus dari toko.` 
            });
        } catch (error) {
            console.error(chalk.red('Remove Product Error:'), error);
            throw error;
        }
    }

    async listOrders(sock, from, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            const orders = config.loadOrders();
            
            if (orders.length === 0) {
                await sock.sendMessage(from, { 
                    text: '📦 *Tidak Ada Pesanan*\n\nBelum ada pesanan yang masuk.' 
                });
                return;
            }
            
            let ordersText = '📦 *DAFTAR PESANAN*\n\n';
            
            orders.forEach((order, index) => {
                ordersText += `*${index + 1}. Order ID: ${order.id}*\n`;
                ordersText += `   Pembeli: ${order.buyer.split('@')[0]}\n`;
                ordersText += `   Total: Rp ${order.total.toLocaleString()}\n`;
                ordersText += `   Status: ${order.status}\n`;
                ordersText += `   Tanggal: ${new Date(order.date).toLocaleDateString()}\n\n`;
            });
            
            await sock.sendMessage(from, { text: ordersText });
        } catch (error) {
            console.error(chalk.red('List Orders Error:'), error);
            throw error;
        }
    }

    async confirmOrder(sock, from, args, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            const orderId = args.trim();
            const orders = config.loadOrders();
            const order = orders.find(o => o.id === orderId);
            
            if (!order) {
                await sock.sendMessage(from, { 
                    text: '❌ *Order Tidak Ditemukan*' 
                });
                return;
            }
            
            order.status = 'completed';
            order.completedAt = new Date().toISOString();
            config.saveOrders(orders);
            
            await sock.sendMessage(from, { 
                text: `✅ *Order Dikonfirmasi*\n\nOrder ${orderId} telah dikonfirmasi sebagai selesai.` 
            });
            
            // Notify buyer
            await sock.sendMessage(order.buyer, {
                text: `🎉 *ORDER SELESAI*\n\nOrder ID: ${orderId}\nStatus: Selesai\n\nTerima kasih telah berbelanja di toko kami!`
            });
        } catch (error) {
            console.error(chalk.red('Confirm Order Error:'), error);
            throw error;
        }
    }

    async cancelOrder(sock, from, args, config) {
        try {
            if (!config.isOwner(from)) {
                await sock.sendMessage(from, { 
                    text: '❌ *Akses Ditolak*\n\nHanya owner yang dapat menggunakan command ini.' 
                });
                return;
            }
            
            const orderId = args.trim();
            const orders = config.loadOrders();
            const order = orders.find(o => o.id === orderId);
            
            if (!order) {
                await sock.sendMessage(from, { 
                    text: '❌ *Order Tidak Ditemukan*' 
                });
                return;
            }
            
            order.status = 'cancelled';
            order.cancelledAt = new Date().toISOString();
            config.saveOrders(orders);
            
            await sock.sendMessage(from, { 
                text: `❌ *Order Dibatalkan*\n\nOrder ${orderId} telah dibatalkan.` 
            });
            
            // Notify buyer
            await sock.sendMessage(order.buyer, {
                text: `❌ *ORDER DIBATALKAN*\n\nOrder ID: ${orderId}\nStatus: Dibatalkan\n\nSilahkan hubungi owner untuk informasi lebih lanjut.`
            });
        } catch (error) {
            console.error(chalk.red('Cancel Order Error:'), error);
            throw error;
        }
    }
}

module.exports = new Admin();
