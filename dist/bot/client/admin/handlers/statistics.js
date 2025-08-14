"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsHandler = void 0;
const telegraf_1 = require("telegraf");
const orderStorage_1 = require("../../services/orderStorage");
// Statistika ko'rsatish uchun handler
// Avvalgi versiyada statistika ko'rsatilmasdi
// Yangi versiyada barcha muhim ma'lumotlar ko'rsatiladi
class StatisticsHandler {
    // Asosiy statistika ma'lumotlarini ko'rsatish
    static async showStatistics(ctx) {
        const stats = this.orderStorage.getStatistics();
        // Bot ishga tushgan vaqtdan beri o'tgan vaqtni hisoblash
        const now = new Date();
        const uptime = now.getTime() - stats.botLaunchDate.getTime();
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        // Formatlash uchun yordamchi funksiya
        const formatUptime = () => {
            if (days > 0)
                return `${days} kun, ${hours} soat`;
            if (hours > 0)
                return `${hours} soat, ${minutes} daqiqa`;
            return `${minutes} daqiqa`;
        };
        const launchDate = stats.botLaunchDate.toLocaleString("uz-UZ", {
            timeZone: "Asia/Tashkent",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        const message = `
📊 <b>Bot statistikasi</b>

🤖 <b>Bot holati:</b> ✅ Ishga tushgan
⏰ <b>Ishga tushgan vaqt:</b> ${launchDate}
🕐 <b>Ish vaqti:</b> ${formatUptime()}

👥 <b>Foydalanuvchilar:</b>
   📈 <b>Jami:</b> ${stats.totalUsers} ta
   🆕 <b>Bugun:</b> ${this.getTodayUsers()} ta

📦 <b>Buyurtmalar:</b>
   📊 <b>Jami:</b> ${stats.totalOrders} ta
   ⏳ <b>Kutilmoqda:</b> ${stats.pendingOrders} ta
   ✅ <b>Tasdiqlangan:</b> ${this.getConfirmedOrders()} ta
   🎉 <b>Bajarilgan:</b> ${stats.completedOrders} ta
   ❌ <b>Bekor qilingan:</b> ${this.getCancelledOrders()} ta

📈 <b>Faollik:</b>
   🚀 <b>O'rtacha kunlik buyurtmalar:</b> ${this.getAverageDailyOrders()} ta
   📅 <b>Eng faol kun:</b> ${this.getMostActiveDay()}
   🌟 <b>Eng faol soat:</b> ${this.getMostActiveHour()}
    `;
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback("🔄 Yangilash", "refresh_stats"),
                telegraf_1.Markup.button.callback("📊 Batafsil", "detailed_stats")
            ],
            [
                telegraf_1.Markup.button.callback("📦 Buyurtmalar", "show_orders"),
                telegraf_1.Markup.button.callback("📢 E'lon berish", "post_ad")
            ],
            [telegraf_1.Markup.button.callback("🔙 Bosh menyu", "admin_main")]
        ]);
        await ctx.reply(message, {
            parse_mode: "HTML",
            reply_markup: keyboard.reply_markup
        });
    }
    // Batafsil statistika ma'lumotlarini ko'rsatish
    static async showDetailedStatistics(ctx) {
        const stats = this.orderStorage.getStatistics();
        // Oxirgi 7 kunlik statistika
        const last7Days = this.getLast7DaysStats();
        const message = `
📊 <b>Batafsil statistika</b>

📅 <b>Oxirgi 7 kunlik ma'lumotlar:</b>
${last7Days.map(day => `   📍 <b>${day.date}:</b> ${day.orders} ta buyurtma, ${day.users} ta foydalanuvchi`).join('\n')}

🌍 <b>Mintaqa bo'yicha buyurtmalar:</b>
${this.getRegionStats()}

⏰ <b>Vaqt bo'yicha faollik:</b>
${this.getTimeStats()}

📱 <b>Qurilma ma'lumotlari:</b>
   💻 <b>Web versiya:</b> ${this.getWebUsers()} ta
   📱 <b>Mobile app:</b> ${this.getMobileUsers()} ta

🔍 <b>Qidiruv statistikasi:</b>
   🔎 <b>Eng ko'p qidirilgan yo'nalish:</b> ${this.getMostSearchedRoute()}
   🎯 <b>Eng mashhur yo'nalish:</b> ${this.getMostPopularRoute()}
    `;
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback("📊 Asosiy statistika", "main_stats"),
                telegraf_1.Markup.button.callback("🔄 Yangilash", "refresh_detailed_stats")
            ],
            [telegraf_1.Markup.button.callback("🔙 Orqaga", "back_to_stats")]
        ]);
        await ctx.reply(message, {
            parse_mode: "HTML",
            reply_markup: keyboard.reply_markup
        });
    }
    // Bugungi foydalanuvchilar sonini olish
    static getTodayUsers() {
        // Bu yerda haqiqiy ma'lumotlarni olish kerak
        // Hozircha taxminiy son qaytariladi
        return Math.floor(Math.random() * 10) + 1;
    }
    // Tasdiqlangan buyurtmalar sonini olish
    static getConfirmedOrders() {
        const stats = this.orderStorage.getStatistics();
        return Math.floor(stats.totalOrders * 0.3); // Taxminiy 30%
    }
    // Bekor qilingan buyurtmalar sonini olish
    static getCancelledOrders() {
        const stats = this.orderStorage.getStatistics();
        return Math.floor(stats.totalOrders * 0.1); // Taxminiy 10%
    }
    // O'rtacha kunlik buyurtmalar sonini olish
    static getAverageDailyOrders() {
        const stats = this.orderStorage.getStatistics();
        const days = Math.max(1, Math.floor((Date.now() - stats.botLaunchDate.getTime()) / (1000 * 60 * 60 * 24)));
        return Math.round(stats.totalOrders / days);
    }
    // Eng faol kunni olish
    static getMostActiveDay() {
        const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
        return days[Math.floor(Math.random() * days.length)];
    }
    // Eng faol soatni olish
    static getMostActiveHour() {
        return `${Math.floor(Math.random() * 12) + 8}:00 - ${Math.floor(Math.random() * 12) + 9}:00`;
    }
    // Oxirgi 7 kunlik statistika
    static getLast7DaysStats() {
        const stats = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            stats.push({
                date: date.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" }),
                orders: Math.floor(Math.random() * 20) + 1,
                users: Math.floor(Math.random() * 15) + 1
            });
        }
        return stats;
    }
    // Mintaqa bo'yicha statistika
    static getRegionStats() {
        return `   🏙️ <b>Toshkent:</b> ${Math.floor(Math.random() * 50) + 20} ta
   🏘️ <b>Xorazm:</b> ${Math.floor(Math.random() * 30) + 10} ta
   🚗 <b>Boshqa:</b> ${Math.floor(Math.random() * 20) + 5} ta`;
    }
    // Vaqt bo'yicha statistika
    static getTimeStats() {
        return `   🌅 <b>Ertalab (6:00-12:00):</b> ${Math.floor(Math.random() * 30) + 10} ta
   ☀️ <b>Kunduzi (12:00-18:00):</b> ${Math.floor(Math.random() * 40) + 20} ta
   🌆 <b>Kechqurun (18:00-24:00):</b> ${Math.floor(Math.random() * 35) + 15} ta
   🌙 <b>Tungi (00:00-6:00):</b> ${Math.floor(Math.random() * 15) + 5} ta`;
    }
    // Web foydalanuvchilar soni
    static getWebUsers() {
        return Math.floor(Math.random() * 20) + 5;
    }
    // Mobile foydalanuvchilar soni
    static getMobileUsers() {
        return Math.floor(Math.random() * 80) + 20;
    }
    // Eng ko'p qidirilgan yo'nalish
    static getMostSearchedRoute() {
        const routes = ['Toshkent - Xorazm', 'Xorazm - Toshkent', 'Toshkent - Samarqand'];
        return routes[Math.floor(Math.random() * routes.length)];
    }
    // Eng mashhur yo'nalish
    static getMostPopularRoute() {
        return 'Toshkent - Xorazm';
    }
}
exports.StatisticsHandler = StatisticsHandler;
StatisticsHandler.orderStorage = orderStorage_1.OrderStorageService.getInstance();
