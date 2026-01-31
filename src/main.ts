import { Telegraf, Scenes, session } from "telegraf";
import { MyContext } from "./bot/client/types/context";
import { setupClientBot } from "./bot/client/clientBot";
import { setupAdminBot } from "./bot/client/admin/adminBot";
import { DatabaseService } from "./services/database";
import { logger } from "./services/logger";
import { sceneInterruptionMiddleware, setupSceneInterruptionHandler } from "./middlewares/sceneMiddleware";
import { CONFIG, validateConfig } from "./config";
import { addRouteScene, announcementScene } from "./bot/client/admin/handlers/ads";
import { orderTaxiScene } from "./bot/client/handlers/orderTaxi";

// Global xatolarni tutish
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", "Process", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Rejection", "Process", reason instanceof Error ? reason : new Error(String(reason)));
});

// Konfiguratsiyani tekshirish
try {
  validateConfig();
  logger.info("Konfiguratsiya to'g'ri yuklandi", "Config");
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Noma'lum xatolik";
  logger.error("Konfiguratsiya xatosi", "Config", error instanceof Error ? error : new Error(errorMessage));
  process.exit(1);
}

// Bot yaratish
export const bot = new Telegraf<MyContext>(CONFIG.BOT_TOKEN);

// Telegraf rasmiy session middleware
bot.use(session());

// Scene interruption middleware - session dan OLDIN, stage dan OLDIN bo'lishi kerak
// Session.__scenes oldingi requestdan saqlanadi, shuning uchun bu ishlaydi
bot.use(sceneInterruptionMiddleware());

// Sahnalarni ro'yxatdan o'tkazish
const stage = new Scenes.Stage<MyContext>([addRouteScene, announcementScene, orderTaxiScene]);
bot.use(stage.middleware());

// Scene interruption callback handler larni sozlash
setupSceneInterruptionHandler(bot);

// Ma'lumotlar bazasi servisini ishga tushirish
const databaseService = DatabaseService.getInstance();

// Admin va client botlarni sozlash
setupAdminBot(bot);
setupClientBot(bot);

// Bot xatolarini tutish
bot.catch((error: any, ctx: MyContext) => {
  logger.botError(`Bot xatosi: ${error.message}`, error instanceof Error ? error : new Error(String(error)), ctx.from?.id);
});

// Botni ishga tushirish
bot.launch()
  .then(async () => {
    logger.info("Bot ishga tushdi", "Bot");

    try {
      await databaseService.updateStatistics();
      logger.info("Statistika yangilandi", "Database");
    } catch (error) {
      logger.dbError("Statistika yangilashda xatolik", error instanceof Error ? error : new Error(String(error)));
    }
  })
  .catch((error: Error) => {
    logger.error("Bot ishga tushishda xatolik", "Bot", error);
    process.exit(1);
  });

// Graceful shutdown
process.once("SIGINT", async () => {
  logger.info("Bot to'xtatilmoqda (SIGINT)", "Process");
  await databaseService.disconnect();
  bot.stop("SIGINT");
});

process.once("SIGTERM", async () => {
  logger.info("Bot to'xtatilmoqda (SIGTERM)", "Process");
  await databaseService.disconnect();
  bot.stop("SIGTERM");
});
