import { Telegraf, Scenes, session } from "telegraf";
import { MyContext } from "./bot/client/types/context";
import { setupClientBot } from "./bot/client/clientBot";
import { setupAdminBot } from "./bot/client/admin/adminBot";
import { DatabaseService } from "./services/database";
import { CONFIG, validateConfig } from "./config";
import { addRouteScene, announcementScene } from "./bot/client/admin/handlers/ads";
import { orderTaxiScene } from "./bot/client/handlers/orderTaxi";

// Konfiguratsiyani tekshirish
try {
  validateConfig();
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Noma'lum xatolik";
  console.error("❌ Konfiguratsiya xatosi:", errorMessage);
  process.exit(1);
}

// Bot yaratish
export const bot = new Telegraf<MyContext>(CONFIG.BOT_TOKEN);

// Telegraf rasmiy session middleware
bot.use(session());

// Sahnalarni ro'yxatdan o'tkazish
const stage = new Scenes.Stage<MyContext>([addRouteScene, announcementScene, orderTaxiScene]);
bot.use(stage.middleware());

// Ma'lumotlar bazasi servisini ishga tushirish
const databaseService = DatabaseService.getInstance();

// Admin va client botlarni sozlash
setupAdminBot(bot);
setupClientBot(bot);

// Botni ishga tushirish
bot.launch().then(async () => {
  console.log("🤖 Bot ishga tushdi");

  try {
    await databaseService.updateStatistics();
    console.log("📊 Statistika yangilandi");
  } catch (error) {
    console.error("❌ Statistika yangilashda xatolik:", error);
  }
});

// Graceful shutdown
process.once("SIGINT", async () => {
  console.log("🛑 Bot to'xtatilmoqda...");
  await databaseService.disconnect();
  bot.stop("SIGINT");
});

process.once("SIGTERM", async () => {
  console.log("🛑 Bot to'xtatilmoqda...");
  await databaseService.disconnect();
  bot.stop("SIGTERM");
});
