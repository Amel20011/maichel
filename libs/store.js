const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class Store {
    async showProducts(sock, from, config) {
        try {
            const products = config.loadProducts();
            
            if (products.length === 0) {
                await sock.sendMessage(from, { 
                    text: '🛒 *Toko Kosong*\n\nBelum ada produk yang tersedia di toko.' 
                });
                return;
            }
            
            let productList = '🛍️ *DAFTAR PRODUK*\n\n';
            products.forEach((product, index) => {
                productList += `*${index + 1}. ${product.name}*\n`;
                productList += `   💰 Harga: Rp ${product.price.toLocaleString()}\n`;
                productList += `   📦 Stok: ${product.stock}\n`;
                productList += `   🆔 ID: ${product.id}\n\n`;
            });
            
            productList += `\nGunakan ${config.prefix}product [id] untuk melihat detail produk.`;
            
            await sock.sendMessage(from, { 
                text: productList,
                buttons: [
                    { buttonId: 'cart_button', buttonText: { displayText: '🛒 Lihat Keranjang' }, type: 1 },
                    { buttonId: 'order_button', buttonText: { displayText: '📦 Lihat Pesanan' }, type: 1 },
                    { buttonId: 'checkout_button', buttonText: { displayText: '💳 Checkout' }, type: 1 }
                ]
            });
        } catch (error) {
            console.error(chalk.red('Store Error:'), error);
            throw error;
        }
    }

    async showProductDetails(sock, from, args, config) {
        try {
            const productId = args.trim();
            const products = config.loadProducts();
            const product = products.find(p => p.id === productId);
            
            if (!product) {
                await sock.sendMessage(from, { 
                    text: '❌ *Produk Tidak Ditemukan*\n\nID produk tidak valid atau produk tidak tersedia.' 
                });
                return;
            }
            
            const productDetail = `📦 *DETAIL PRODUK*\n\n` +
                                 `*Nama:* ${product.name}\n` +
                                 `*Harga:* Rp ${product.price.toLocaleString()}\n` +
                                 `*Stok:* ${product.stock}\n` +
                                 `*Deskripsi:* ${product.description || 'Tidak ada deskripsi'}\n` +
                                 `*ID:* ${product.id}\n\n` +
                                 `Gunakan ${config.prefix}addcart ${product.id} [jumlah] untuk menambah ke keranjang.`;
            
            await sock.sendMessage(from, { text: productDetail });
        } catch (error) {
            console.error(chalk.red('Product Detail Error:'), error);
            throw error;
        }
    }

    async addToCart(sock, from, sender, args, config) {
        try {
            const [productId, quantity = '1'] = args.split(' ');
            const products = config.loadProducts();
            const product = products.find(p => p.id === productId);
            
            if (!product) {
                await sock.sendMessage(from, { 
                    text: '❌ *Produk Tidak Ditemukan*' 
                });
                return;
            }
            
            if (product.stock < parseInt(quantity)) {
                await sock.sendMessage(from, { 
                    text: `❌ *Stok Tidak Cukup*\n\nStok tersedia: ${product.stock}` 
                });
                return;
            }
            
            const carts = config.loadCarts();
            if (!carts[sender]) {
                carts[sender] = [];
            }
            
            const existingItem = carts[sender].find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += parseInt(quantity);
            } else {
                carts[sender].push({
                    productId,
                    name: product.name,
                    price: product.price,
                    quantity: parseInt(quantity)
                });
            }
            
            config.saveCarts(carts);
            
            await sock.sendMessage(from, { 
                text: `✅ *Berhasil Ditambahkan*\n\n${product.name} x${quantity} telah ditambahkan ke keranjang.` 
            });
        } catch (error) {
            console.error(chalk.red('Add to Cart Error:'), error);
            throw error;
        }
    }

    async showCart(sock, from, sender, config) {
        try {
            const carts = config.loadCarts();
            const userCart = carts[sender] || [];
            
            if (userCart.length === 0) {
                await sock.sendMessage(from, { 
                    text: '🛒 *Keranjang Kosong*\n\nKeranjang belanja Anda masih kosong.' 
                });
                return;
            }
            
            let cartText = '🛒 *KERANJANG BELANJA*\n\n';
            let total = 0;
            
            userCart.forEach((item, index) => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                cartText += `*${index + 1}. ${item.name}*\n`;
                cartText += `   💰 Harga: Rp ${item.price.toLocaleString()}\n`;
                cartText += `   📦 Jumlah: ${item.quantity}\n`;
                cartText += `   🧾 Subtotal: Rp ${subtotal.toLocaleString()}\n\n`;
            });
            
            cartText += `*TOTAL: Rp ${total.toLocaleString()}*\n\n`;
            cartText += `Gunakan ${config.prefix}checkout untuk melanjutkan pembayaran.\n`;
            cartText += `Gunakan ${config.prefix}removecart [no] untuk menghapus item.`;
            
            await sock.sendMessage(from, { 
                text: cartText,
                buttons: [
                    { buttonId: 'checkout_button', buttonText: { displayText: '💳 Checkout' }, type: 1 },
                    { buttonId: 'store_button', buttonText: { displayText: '🛍️ Lihat Produk' }, type: 1 }
                ]
            });
        } catch (error) {
            console.error(chalk.red('Show Cart Error:'), error);
            throw error;
        }
    }

    async removeFromCart(sock, from, sender, args, config) {
        try {
            const index = parseInt(args) - 1;
            const carts = config.loadCarts();
            const userCart = carts[sender] || [];
            
            if (index < 0 || index >= userCart.length) {
                await sock.sendMessage(from, { 
                    text: '❌ *Item Tidak Ditemukan*\n\nNomor item tidak valid.' 
                });
                return;
            }
            
            const removedItem = userCart.splice(index, 1)[0];
            config.saveCarts(carts);
            
            await sock.sendMessage(from, { 
                text: `✅ *Item Dihapus*\n\n${removedItem.name} telah dihapus dari keranjang.` 
            });
        } catch (error) {
            console.error(chalk.red('Remove from Cart Error:'), error);
            throw error;
        }
    }

    async showOrders(sock, from, sender, config) {
        try {
            const orders = config.loadOrders();
            const userOrders = orders.filter(order => order.buyer === sender);
            
            if (userOrders.length === 0) {
                await sock.sendMessage(from, { 
                    text: '📦 *Belum Ada Pesanan*\n\nAnda belum memiliki pesanan.' 
                });
                return;
            }
            
            let ordersText = '📦 *PESANAN ANDA*\n\n';
            
            userOrders.forEach((order, index) => {
                ordersText += `*${index + 1}. Order ID: ${order.id}*\n`;
                ordersText += `   📅 Tanggal: ${new Date(order.date).toLocaleDateString()}\n`;
                ordersText += `   💰 Total: Rp ${order.total.toLocaleString()}\n`;
                ordersText += `   📍 Status: ${order.status}\n\n`;
            });
            
            await sock.sendMessage(from, { text: ordersText });
        } catch (error) {
            console.error(chalk.red('Show Orders Error:'), error);
            throw error;
        }
    }
}

module.exports = new Store();
