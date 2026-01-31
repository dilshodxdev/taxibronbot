"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const telegraf_1 = require("telegraf");
const clientBot_1 = require("./bot/client/clientBot");
const adminBot_1 = require("./bot/client/admin/adminBot");
const database_1 = require("./services/database");
const logger_1 = require("./services/logger");
const sceneMiddleware_1 = require("./middlewares/sceneMiddleware");
const config_1 = require("./config");
const ads_1 = require("./bot/client/admin/handlers/ads");
const orderTaxi_1 = require("./bot/client/handlers/orderTaxi");
// Global xatolarni tutish
process.on("uncaughtException", (error) => {
    logger_1.logger.error("Uncaught Exception", "Process", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    logger_1.logger.error("Unhandled Rejection", "Process", reason instanceof Error ? reason : new Error(String(reason)));
});
// Konfiguratsiyani tekshirish
try {
    (0, config_1.validateConfig)();
    logger_1.logger.info("Konfiguratsiya to'g'ri yuklandi", "Config");
}
catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Noma'lum xatolik";
    logger_1.logger.error("Konfiguratsiya xatosi", "Config", error instanceof Error ? error : new Error(errorMessage));
    process.exit(1);
}
// Bot yaratish
exports.bot = new telegraf_1.Telegraf(config_1.CONFIG.BOT_TOKEN);
// Telegraf rasmiy session middleware
exports.bot.use((0, telegraf_1.session)());
// Scene interruption middleware - session dan OLDIN, stage dan OLDIN bo'lishi kerak
// Session.__scenes oldingi requestdan saqlanadi, shuning uchun bu ishlaydi
exports.bot.use((0, sceneMiddleware_1.sceneInterruptionMiddleware)());
// Sahnalarni ro'yxatdan o'tkazish
const stage = new telegraf_1.Scenes.Stage([ads_1.addRouteScene, ads_1.announcementScene, orderTaxi_1.orderTaxiScene]);
exports.bot.use(stage.middleware());
// Scene interruption callback handler larni sozlash
(0, sceneMiddleware_1.setupSceneInterruptionHandler)(exports.bot);
// Ma'lumotlar bazasi servisini ishga tushirish
const databaseService = database_1.DatabaseService.getInstance();
// Admin va client botlarni sozlash
(0, adminBot_1.setupAdminBot)(exports.bot);
(0, clientBot_1.setupClientBot)(exports.bot);
// Bot xatolarini tutish
exports.bot.catch((error, ctx) => {
    logger_1.logger.botError(`Bot xatosi: ${error.message}`, error instanceof Error ? error : new Error(String(error)), ctx.from?.id);
});
// Botni ishga tushirish
exports.bot.launch()
    .then(async () => {
    logger_1.logger.info("Bot ishga tushdi", "Bot");
    try {
        await databaseService.updateStatistics();
        logger_1.logger.info("Statistika yangilandi", "Database");
    }
    catch (error) {
        logger_1.logger.dbError("Statistika yangilashda xatolik", error instanceof Error ? error : new Error(String(error)));
    }
})
    .catch((error) => {
    logger_1.logger.error("Bot ishga tushishda xatolik", "Bot", error);
    process.exit(1);
});
// Graceful shutdown
process.once("SIGINT", async () => {
    logger_1.logger.info("Bot to'xtatilmoqda (SIGINT)", "Process");
    await databaseService.disconnect();
    exports.bot.stop("SIGINT");
});
process.once("SIGTERM", async () => {
    logger_1.logger.info("Bot to'xtatilmoqda (SIGTERM)", "Process");
    await databaseService.disconnect();
    exports.bot.stop("SIGTERM");
});
