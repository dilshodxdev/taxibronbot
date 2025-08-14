import { Telegraf, Markup } from "telegraf";
import { MyContext } from "./types/context";
import { DatabaseService } from "../../services/database";
import { CONFIG } from "../../config";
import { fromDistrictsKeyboard } from "./keyboards/fromDistricts";
import { fromRegionsKeyboard } from "./keyboards/fromRegions";
import { regionKeyboard } from "./keyboards/region";
import { startButtonsKeyboard } from "./keyboards/startButtons";
import { tashkentDistrictsKeyboard } from "./keyboards/tashkentDistricts";
import { xorazmDistrictsKeyboard } from "./keyboards/xorazmDistricts";

// Client bot sozlamalari va boshqaruvi
// Avvalgi versiyada OrderStorageService xotirada ma'lumotlarni saqlardi
// Yangi versiyada DatabaseService orqali barcha ma'lumotlar ma'lumotlar bazasida saqlanadi
export function setupClientBot(bot: Telegraf<MyContext>) {
  // Database service ni olish
  // Buyurtmalarni saqlash va boshqarish uchun DatabaseService dan foydalaniladi
  // Bu service buyurtmalarni SQLite ma'lumotlar bazasida saqlaydi
  const databaseService = DatabaseService.getInstance();

  // Asosiy menyu reply keyboard - foydalanuvchi uchun qulay interfeys
  // Avvalgi versiyada inline keyboard ishlatilardi, endi reply keyboard qaytarildi
  const mainMenuKeyboard = Markup.keyboard([
    ["🚕 Taksi buyurtma qilish"],
    ["👤 Operator bilan bog'lanish"],
    ["🧾 Mening buyurtmalarim", "ℹ️ Yordam"]
  ]).resize();

  // Start buyrug'i - asosiy menyu bilan
  bot.start(async (ctx) => {
    const welcomeMessage = `
🚗 <b>Xush kelibsiz!</b>

Taksi buyurtma qilish uchun quyidagi tugmalardan birini tanlang:
    `;

    await ctx.reply(welcomeMessage, {
      parse_mode: "HTML",
      reply_markup: mainMenuKeyboard.reply_markup
    });
  });

  // Reply keyboard tugmalarini qayta ishlash
  // Bu tugmalar foydalanuvchi tomonidan bosilganda ishga tushadi
  
  // Taxi buyurtma qilish tugmasi
  bot.hears("🚕 Taksi buyurtma qilish", async (ctx) => {
    // Yangi wizard scene ni ishga tushirish - bu foydalanuvchi buyurtma jarayonini to'liq boshqaradi
    // Avvalgi versiyada inline keyboard ishlatilardi, endi wizard scene ishlatiladi
    await ctx.scene.enter("ORDER_TAXI_SCENE");
  });

  // Operator bilan bog'lanish tugmasi
  bot.hears("👤 Operator bilan bog'lanish", async (ctx) => {
    await ctx.reply("👤 Operator bilan bog'lanish uchun @taxibronbot_admin ga yozing");
  });

  // Mening buyurtmalarim tugmasi
  bot.hears("🧾 Mening buyurtmalarim", async (ctx) => {
    if (ctx.from?.id) {
      const userOrders = await databaseService.getOrdersByUserId(ctx.from.id.toString());
      
      if (userOrders.length === 0) {
        await ctx.reply("📝 Sizda hali buyurtmalar yo'q. Yangi buyurtma qilish uchun '🚕 Taxi buyurtma qilish' tugmasini bosing.");
      } else {
        let ordersMessage = "📝 <b>Sizning buyurtmalaringiz:</b>\n\n";
        
        userOrders.forEach((order: any, index: number) => {
          const statusEmoji = getStatusEmoji(order.status);
          const time = order.createdAt.toLocaleString("uz-UZ", {
            timeZone: "Asia/Tashkent",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
          
          ordersMessage += `${index + 1}. ${statusEmoji} <b>${order.orderNumber}</b>\n`;
          ordersMessage += `📍 <b>Yo'nalish:</b> ${order.fromRegion} → ${order.toRegion}\n`;
          ordersMessage += `⏰ <b>Vaqt:</b> ${time}\n`;
          ordersMessage += `📊 <b>Holat:</b> ${getStatusText(order.status)}\n\n`;
        });
        
        await ctx.reply(ordersMessage, { parse_mode: "HTML" });
      }
    } else {
      await ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi.");
    }
  });

  // Yordam tugmasi
  bot.hears("ℹ️ Yordam", async (ctx) => {
    const helpMessage = `
🔧 <b>Yordam</b>

🚗 <b>Taksi buyurtma qilish:</b>
   1. "🚕 Taxi buyurtma qilish" tugmasini bosing
   2. Yo'nalishni tanlang
   3. Tuman yoki viloyatni tanlang
   4. To'liq ismingizni kiriting
   5. Telefon raqamingizni kiriting

📞 <b>Qo'llab-quvvatlash:</b>
   Operator bilan bog'lanish uchun "👤Operator bilan bog'lanish" tugmasini bosing

🔄 <b>Boshqa buyruqlar:</b>
   /start - Bosh menyu
   /help - Yordam
    `;

    await ctx.reply(helpMessage, { parse_mode: "HTML" });
  });

  // Eski inline keyboard handler lar o'chirildi - endi wizard scene ishlatiladi
  // Bu handler lar avvalgi versiyada ishlatilardi, lekin endi ular kerak emas

  // Inline keyboard callback query larni qayta ishlash - order flow uchun
  // Bu handler lar wizard scene da ishlatiladi, shuning uchun bu yerda ularni qo'shish shart emas
  // Wizard scene o'zi barcha callback larni qayta ishlaydi

  // Xavfsizlik uchun callback handler lar qo'shamiz - agar wizard scene ishlamasa
  // Bu handler lar wizard scene da callback query kelganda ishga tushadi
  
  // Region tanlash callback lari - barcha viloyatlar uchun
  bot.action(/^region_(.+)$/, async (ctx) => {
    if ('data' in ctx.callbackQuery) {
      // console.log("Region callback received:", ctx.callbackQuery.data); // Debug uchun
    }
    // Bu callback wizard scene da qayta ishlanadi
    await ctx.answerCbQuery();
  });

  // Tashkent tuman tanlash callback lari
  bot.action(/^tashkent_(.+)$/, async (ctx) => {
    if ('data' in ctx.callbackQuery) {
      // console.log("Tashkent district callback received:", ctx.callbackQuery.data); // Debug uchun
    }
    // Bu callback wizard scene da qayta ishlanadi
    await ctx.answerCbQuery();
  });

  // Xorazm tuman tanlash callback lari
  bot.action(/^xorazm_(.+)$/, async (ctx) => {
    if ('data' in ctx.callbackQuery) {
      // console.log("Xorazm district callback received:", ctx.callbackQuery.data); // Debug uchun
    }
    // Bu callback wizard scene da qayta ishlanadi
    await ctx.answerCbQuery();
  });

  // Ikkinchi viloyat tanlash callback lari
  bot.action(/^to_region_(.+)$/, async (ctx) => {
    if ('data' in ctx.callbackQuery) {
      // console.log("To region callback received:", ctx.callbackQuery.data); // Debug uchun
    }
    // Bu callback wizard scene da qayta ishlanadi
    await ctx.answerCbQuery();
  });

  // Eski sendOrderSummary funksiyasi o'chirildi - endi wizard scene da bajariladi
  // Bu funksiya avvalgi versiyada ishlatilardi, lekin endi ular kerak emas

  // Yordam va operator bilan bog'lanish
  bot.action("help", async (ctx) => {
    const helpMessage = `
🔧 <b>Yordam</b>

🚗 <b>Taksi buyurtma qilish:</b>
   1. Start tugmasini bosing
   2. Yo'nalishni tanlang
   3. Tuman yoki viloyatni tanlang
   4. To'liq ismingizni kiriting
   5. Telefon raqamingizni kiriting

📞 <b>Qo'llab-quvvatlash:</b>
   Admin bilan bog'lanish uchun @taxibronbot_admin ga yozing

🔄 <b>Boshqa buyruqlar:</b>
   /start - Bosh menyu
   /help - Yordam
    `;

    await ctx.reply(helpMessage, { parse_mode: "HTML" });
  });

  bot.action("contact_operator", async (ctx) => {
    await ctx.reply("👤 Operator bilan bog'lanish uchun @taxibronbot_admin ga yozing yoki /start buyrug'ini bering.");
  });

  // Help buyrug'i - to'g'ridan-to'g'ri /help yozganda
  bot.help(async (ctx) => {
    const helpMessage = `
🔧 <b>Yordam</b>

🚗 <b>Taksi buyurtma qilish:</b>
   1. Start tugmasini bosing
   2. Yo'nalishni tanlang
   3. Tuman yoki viloyatni tanlang
   4. To'liq ismingizni kiriting
   5. Telefon raqamingizni kiriting

📞 <b>Qo'llab-quvvatlash:</b>
   Admin bilan bog'lanish uchun @taxibronbot_admin ga yozing

🔄 <b>Boshqa buyruqlar:</b>
   /start - Bosh menyu
   /help - Yordam
    `;

    await ctx.reply(helpMessage, { parse_mode: "HTML" });
  });

  // Yordamchi funksiyalar
  function getStatusEmoji(status: string): string {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'CONFIRMED': return '✅';
      case 'COMPLETED': return '🎉';
      case 'CANCELLED': return '❌';
      default: return '❓';
    }
  }

  function getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return 'Kutilmoqda';
      case 'CONFIRMED': return 'Tasdiqlangan';
      case 'COMPLETED': return 'Bajarilgan';
      case 'CANCELLED': return 'Bekor qilingan';
      default: return 'Noma\'lum';
    }
  }
}
