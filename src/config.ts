import { config } from "dotenv";

// Environment variables ni yuklash
config();

// Bot konfiguratsiyasi
// Avvalgi versiyada environment variables to'g'ridan-to'g'ri ishlatilardi
// Yangi versiyada barcha konfiguratsiya markazlashtirilgan va xatolarni oldini oladi
export const CONFIG = {
  // Bot token - majburiy
  BOT_TOKEN:
    process.env.BOT_TOKEN ||
    (() => {
      throw new Error("BOT_TOKEN environment variable is required");
    })(),

  // Admin ID - majburiy
  ADMIN_ID:
    process.env.ADMIN_ID ||
    (() => {
      throw new Error("ADMIN_ID environment variable is required");
    })(),

  // Super Admin ID - majburiy
  SUPER_ADMIN_ID:
    process.env.SUPER_ADMIN_ID ||
    (() => {
      throw new Error("SUPER ADMIN _ID enviroment variable is required");
    })(),

  // Kanal ID - ixtiyoriy
  CHANNEL_ID: process.env.CHANNEL_ID || "",

  // Database URL - standart SQLite fayl
  DATABASE_URL: process.env.DATABASE_URL || "file:./db/database.db",

  // Bot sozlamalari
  BOT: {
    // Session timeout (millisekundlarda)
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 daqiqa

    // Buyurtmalar sahifasida ko'rsatiladigan buyurtmalar soni
    ORDERS_PER_PAGE: 5,

    // Buyurtma raqami format
    ORDER_NUMBER_PREFIX: "ORD-",
    ORDER_NUMBER_PADDING: 6,
  },
};

// Konfiguratsiya to'g'ri yuklanganini tekshirish
export function validateConfig(): void {
  if (!CONFIG.BOT_TOKEN) {
    throw new Error("BOT_TOKEN is required");
  }

  if (!CONFIG.ADMIN_ID) {
    throw new Error("ADMIN_ID is required");
  }

  console.log("✅ Konfiguratsiya to'g'ri yuklandi");
}
