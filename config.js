const fs = require('fs-extra');
const path = require('path');

class Config {
    constructor() {
        this.prefix = '.';
        this.ownerNumber = '13658700681@s.whatsapp.net'; // Ganti dengan nomor owner
        this.botName = 'Liviaa Astranica';
        this.botNumber = '';
        this.sessionName = 'liviaa-session';
        
        // Path database
        this.dataPath = path.join(__dirname, 'data');
        this.ensureDataPaths();
        
        // Load settings
        this.settings = this.loadSettings();
        
        // Welcome message
        this.welcomeMessage = `👋 Welcome @user to @group!\n\nSelamat bergabung di grup kami. Total member: @membercount\n\nJangan lupa baca deskripsi grup ya!`;
        this.goodbyeMessage = `👋 Goodbye @user!\n\nSemoga sukses selalu dan sampai jumpa lagi!`;
    }
    
    ensureDataPaths() {
        const dirs = ['', 'products', 'payments', 'orders', 'users'];
        dirs.forEach(dir => {
            const dirPath = path.join(this.dataPath, dir);
            if (!fs.existsSync(dirPath)) {
                fs.ensureDirSync(dirPath);
            }
        });
    }
    
    loadSettings() {
        const settingsPath = path.join(this.dataPath, 'settings.json');
        if (fs.existsSync(settingsPath)) {
            return fs.readJsonSync(settingsPath);
        }
        return {
            owner: this.ownerNumber,
            botName: this.botName,
            prefix: this.prefix,
            storeOpen: true,
            qrisImage: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=QRIS_PAYMENT_DATA',
            storeInfo: {
                name: 'Toko Liviaa Astranica',
                description: 'Toko online terpercaya dengan berbagai produk berkualitas',
                address: 'Jl. Contoh No. 123',
                phone: '+62 812 3456 7890'
            }
        };
    }
    
    saveSettings() {
        const settingsPath = path.join(this.dataPath, 'settings.json');
        fs.writeJsonSync(settingsPath, this.settings, { spaces: 2 });
    }
    
    loadProducts() {
        const productsPath = path.join(this.dataPath, 'products.json');
        if (fs.existsSync(productsPath)) {
            return fs.readJsonSync(productsPath);
        }
        return [];
    }
    
    saveProducts(products) {
        const productsPath = path.join(this.dataPath, 'products.json');
        fs.writeJsonSync(productsPath, products, { spaces: 2 });
    }
    
    loadUsers() {
        const usersPath = path.join(this.dataPath, 'users.json');
        if (fs.existsSync(usersPath)) {
            return fs.readJsonSync(usersPath);
        }
        return [];
    }
    
    saveUsers(users) {
        const usersPath = path.join(this.dataPath, 'users.json');
        fs.writeJsonSync(usersPath, users, { spaces: 2 });
    }
    
    loadOrders() {
        const ordersPath = path.join(this.dataPath, 'orders.json');
        if (fs.existsSync(ordersPath)) {
            return fs.readJsonSync(ordersPath);
        }
        return [];
    }
    
    saveOrders(orders) {
        const ordersPath = path.join(this.dataPath, 'orders.json');
        fs.writeJsonSync(ordersPath, orders, { spaces: 2 });
    }
    
    loadCarts() {
        const cartsPath = path.join(this.dataPath, 'carts.json');
        if (fs.existsSync(cartsPath)) {
            return fs.readJsonSync(cartsPath);
        }
        return {};
    }
    
    saveCarts(carts) {
        const cartsPath = path.join(this.dataPath, 'carts.json');
        fs.writeJsonSync(cartsPath, carts, { spaces: 2 });
    }
    
    loadGroupSettings(groupId) {
        const groupsPath = path.join(this.dataPath, 'groups.json');
        if (fs.existsSync(groupsPath)) {
            const groups = fs.readJsonSync(groupsPath);
            return groups[groupId] || {
                welcome: true,
                goodbye: true,
                antilink: false,
                antivirtex: false,
                antidelete: false
            };
        }
        return {
            welcome: true,
            goodbye: true,
            antilink: false,
            antivirtex: false,
            antidelete: false
        };
    }
    
    saveGroupSettings(groupId, settings) {
        const groupsPath = path.join(this.dataPath, 'groups.json');
        let groups = {};
        if (fs.existsSync(groupsPath)) {
            groups = fs.readJsonSync(groupsPath);
        }
        groups[groupId] = settings;
        fs.writeJsonSync(groupsPath, groups, { spaces: 2 });
    }
    
    loadAdmins() {
        const adminsPath = path.join(this.dataPath, 'admins.json');
        if (fs.existsSync(adminsPath)) {
            return fs.readJsonSync(adminsPath);
        }
        return [this.ownerNumber];
    }
    
    saveAdmins(admins) {
        const adminsPath = path.join(this.dataPath, 'admins.json');
        fs.writeJsonSync(adminsPath, admins, { spaces: 2 });
    }
    
    isOwner(jid) {
        return jid === this.ownerNumber;
    }
    
    isAdmin(jid) {
        const admins = this.loadAdmins();
        return admins.includes(jid) || this.isOwner(jid);
    }
    
    isRegistered(jid) {
        const users = this.loadUsers();
        return users.some(user => user.jid === jid && user.verified);
    }
    
    registerUser(jid, name) {
        const users = this.loadUsers();
        const existingUser = users.find(user => user.jid === jid);
        
        if (existingUser) {
            existingUser.verified = true;
            existingUser.registeredAt = new Date().toISOString();
        } else {
            users.push({
                jid,
                name,
                verified: true,
                registeredAt: new Date().toISOString(),
                balance: 0,
                limit: 20,
                orders: []
            });
        }
        
        this.saveUsers(users);
        return true;
    }
}

module.exports = new Config();
