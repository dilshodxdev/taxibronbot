"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const telegraf_1 = require("telegraf");
const clientBot_1 = require("./bot/client/clientBot");
const adminBot_1 = require("./bot/client/admin/adminBot");
const database_1 = require("./services/database");
const config_1 = require("./config");
const ads_1 = require("./bot/client/admin/handlers/ads");
const orderTaxi_1 = require("./bot/client/handlers/orderTaxi");
// Konfiguratsiyani tekshirish
try {
    (0, config_1.validateConfig)();
}
catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Noma'lum xatolik";
    console.error("❌ Konfiguratsiya xatosi:", errorMessage);
    process.exit(1);
}
// Bot yaratish
exports.bot = new telegraf_1.Telegraf(config_1.CONFIG.BOT_TOKEN);
// Telegraf rasmiy session middleware
exports.bot.use((0, telegraf_1.session)());
// Sahnalarni ro'yxatdan o'tkazish
const stage = new telegraf_1.Scenes.Stage([ads_1.addRouteScene, ads_1.announcementScene, orderTaxi_1.orderTaxiScene]);
exports.bot.use(stage.middleware());
// Ma'lumotlar bazasi servisini ishga tushirish
const databaseService = database_1.DatabaseService.getInstance();
// Admin va client botlarni sozlash
(0, adminBot_1.setupAdminBot)(exports.bot);
(0, clientBot_1.setupClientBot)(exports.bot);
// Botni ishga tushirish
exports.bot.launch().then(async () => {
    console.log("🤖 Bot ishga tushdi");
    try {
        await databaseService.updateStatistics();
        console.log("📊 Statistika yangilandi");
    }
    catch (error) {
        console.error("❌ Statistika yangilashda xatolik:", error);
    }
});
// Graceful shutdown
process.once("SIGINT", async () => {
    console.log("🛑 Bot to'xtatilmoqda...");
    await databaseService.disconnect();
    exports.bot.stop("SIGINT");
});
process.once("SIGTERM", async () => {
    console.log("🛑 Bot to'xtatilmoqda...");
    await databaseService.disconnect();
    exports.bot.stop("SIGTERM");
});
