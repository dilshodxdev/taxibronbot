import { Telegraf, Markup } from "telegraf";
import { MyContext } from "../types/context";
import { AdminStart } from "./handlers/start";
import { DatabaseService } from "../../../services/database";
import { logger } from "../../../services/logger";
import { getStatusEmoji, getStatusText } from "../../../utils/utils";
import { CONFIG } from "../../../config";

// Admin bot sozlamalari va boshqaruvi
// Avvalgi versiyada faqat e'lon berish funksiyasi bor edi
// Yangi versiyada buyurtmalar, statistika va boshqaruv funksiyalari qo'shildi
export function setupAdminBot(bot: Telegraf<MyContext>) {
  const ADMIN_ID = Number(CONFIG.ADMIN_ID);
  const SUPER_ADMIN_ID = Number(CONFIG.SUPER_ADMIN_ID);
  const CHANNEL_ID = CONFIG.CHANNEL_ID;
  const databaseService = DatabaseService.getInstance();

  // Admin buyruqini qayta ishlash
  bot.command("admin", async (ctx) => {
    if (!ADMIN_ID && !SUPER_ADMIN_ID) {
      console.warn("❗ Hech qanday admin ID .env faylida belgilanmagan");
      return ctx.reply("⚠ Admin tizim sozlamalari noto'g'ri.");
    }

    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) {
      return ctx.reply("🚫 Siz admin emassiz.");
    }
    await ctx.reply("👋 Xush kelibsiz, Admin!", AdminStart());
  });

  // Admin menyu tugmalarini qayta ishlash
  bot.hears("📦 Buyurtmalar", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await showOrders(ctx, 1);
  });

  bot.hears("📊 Statistika", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await showStatistics(ctx);
  });

  bot.hears("📢 E'lon berish", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    // Yangi e'lon berish scene ni ishga tushirish
    await ctx.scene.enter("ANNOUNCEMENT_SCENE");
  });

  // Callback query larni qayta ishlash (pagination va boshqa funksiyalar uchun)
  bot.action(/^page_(\d+)$/, async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    const page = parseInt(ctx.match[1]);
    await showOrders(ctx, page);
  });

  // Buyurtma holatini yangilash
  bot.action(/^status_(.+)_(.+)$/, async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    const [, orderId, newStatus] = ctx.match;
    await updateOrderStatus(ctx, orderId, newStatus);
  });

  // Buyurtma ma'lumotlarini batafsil ko'rsatish
  bot.action(/^order_(.+)$/, async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    const orderId = ctx.match[1];
    await showOrderDetails(ctx, orderId);
  });

  // Statistika yangilash
  bot.action("refresh_stats", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await showStatistics(ctx);
  });

  // Batafsil statistika
  bot.action("detailed_stats", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await showDetailedStatistics(ctx);
  });

  // Asosiy statistika
  bot.action("main_stats", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await showStatistics(ctx);
  });

  // Buyurtmalarni ko'rsatish
  bot.action("show_orders", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await showOrders(ctx, 1);
  });

  // Buyurtmalarni yangilash
  bot.action("refresh_orders", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await showOrders(ctx, 1);
  });

  // Buyurtmalarga qaytish
  bot.action("back_to_orders", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await showOrders(ctx, 1);
  });

  // Statistikaga qaytish
  bot.action("back_to_stats", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await showStatistics(ctx);
  });

  // E'lon berish
  bot.action("post_ad", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await ctx.scene.enter("ADD_ROUTE_SCENE", { channelId: CHANNEL_ID });
  });

  // Admin bosh menyu
  bot.action("admin_main", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await ctx.reply("👋 Xush kelibsiz, Admin!", AdminStart());
  });

  // Batafsil statistikani yangilash
  bot.action("refresh_detailed_stats", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID && ctx.from?.id !== SUPER_ADMIN_ID) return;
    await showDetailedStatistics(ctx);
  });

  // ==================== HELPER FUNCTIONS ====================

  // Buyurtmalarni ko'rsatish (pagination bilan)
  async function showOrders(ctx: MyContext, page: number = 1) {
    try {
      const result = await databaseService.getOrders(page, 5);

      if (result.orders.length === 0) {
        await ctx.reply("📭 Hozircha buyurtmalar yo'q.");
        return;
      }

      let message = `📦 <b>Buyurtmalar (${page}/${result.totalPages})</b>\n\n`;

      result.orders.forEach((order, index) => {
        const statusEmoji = getStatusEmoji(order.status);
        const statusText = getStatusText(order.status);
        const orderDate = new Date(order.createdAt).toLocaleDateString("uz-UZ");

        message += `${index + 1}. <b>${order.orderNumber}</b>\n`;
        message += `   👤 ${order.customerName}\n`;
        message += `   📞 ${order.customerPhone}\n`;
        message += `   📍 ${order.fromRegion}${order.fromDistrict ? ` - ${order.fromDistrict}` : ""
          } → ${order.toRegion}${order.toDistrict ? ` - ${order.toDistrict}` : ""
          }\n`;
        message += `   📅 ${orderDate}\n`;
        message += `   ${statusEmoji} ${statusText}\n\n`;
      });

      const keyboard = createOrdersKeyboard(
        page,
        result.totalPages,
        result.orders
      );

      await ctx.reply(message, {
        parse_mode: "HTML",
        reply_markup: keyboard.reply_markup,
      });
    } catch (error) {
      console.error("Buyurtmalarni ko'rsatishda xatolik:", error);
      await ctx.reply("❌ Buyurtmalarni ko'rsatishda xatolik yuz berdi.");
    }
  }

  // Buyurtma holatini yangilash
  async function updateOrderStatus(
    ctx: MyContext,
    orderId: string,
    newStatus: string
  ) {
    try {
      const success = await databaseService.updateOrderStatus(
        orderId,
        newStatus as any
      );

      if (success) {
        await ctx.reply(
          `✅ Buyurtma holati yangilandi: ${getStatusText(newStatus as any)}`
        );
        // Statistikani yangilash
        await databaseService.updateStatistics();
      } else {
        await ctx.reply("❌ Buyurtma holatini yangilashda xatolik yuz berdi.");
      }
    } catch (error) {
      console.error("Buyurtma holatini yangilashda xatolik:", error);
      await ctx.reply("❌ Buyurtma holatini yangilashda xatolik yuz berdi.");
    }
  }

  // Buyurtma ma'lumotlarini batafsil ko'rsatish
  async function showOrderDetails(ctx: MyContext, orderId: string) {
    try {
      const order = await databaseService.getOrderById(orderId);

      if (!order) {
        await ctx.reply("❌ Buyurtma topilmadi.");
        return;
      }

      const statusEmoji = getStatusEmoji(order.status);
      const statusText = getStatusText(order.status);
      const orderDate = new Date(order.createdAt).toLocaleString("uz-UZ", {
        timeZone: "Asia/Tashkent",
      });

      const message = `
📋 <b>Buyurtma ma'lumotlari</b>

🆔 <b>Buyurtma raqami:</b> ${order.orderNumber}
👤 <b>Mijoz:</b> ${order.customerName}
📞 <b>Telefon:</b> ${order.customerPhone}
📍 <b>Yo'nalish:</b> ${order.fromRegion}${order.fromDistrict ? ` - ${order.fromDistrict}` : ""
        } → ${order.toRegion}${order.toDistrict ? ` - ${order.toDistrict}` : ""}
📅 <b>Sana va vaqt:</b> ${orderDate}
${statusEmoji} <b>Holat:</b> ${statusText}
      `;

      const keyboard = createOrderDetailsKeyboard(order.id, order.status);

      await ctx.reply(message, {
        parse_mode: "HTML",
        reply_markup: keyboard.reply_markup,
      });
    } catch (error) {
      console.error("Buyurtma ma'lumotlarini ko'rsatishda xatolik:", error);
      await ctx.reply(
        "❌ Buyurtma ma'lumotlarini ko'rsatishda xatolik yuz berdi."
      );
    }
  }

  // Statistikani ko'rsatish
  async function showStatistics(ctx: MyContext) {
    try {
      // Statistikani yangilash
      await databaseService.updateStatistics();
      const stats = await databaseService.getBotStatistics();

      if (!stats) {
        await ctx.reply("❌ Statistika ma'lumotlari topilmadi.");
        return;
      }

      const uptime = Date.now() - stats.botLaunchDate.getTime();
      const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      const message = `
📊 <b>Bot statistikasi</b>

🤖 <b>Bot holati:</b> ✅ Ishga tushgan
🚀 <b>Ishga tushgan sana:</b> ${stats.botLaunchDate.toLocaleDateString("uz-UZ")}
⏱️ <b>Ish vaqti:</b> ${days} kun, ${hours} soat

👥 <b>Foydalanuvchilar:</b>
   📊 <b>Jami:</b> ${stats.totalUsers} ta

📦 <b>Buyurtmalar:</b>
   📊 <b>Jami:</b> ${stats.totalOrders} ta
   ⏳ <b>Kutilayotgan:</b> ${stats.pendingOrders} ta
   ✅ <b>Tasdiqlangan:</b> ${stats.confirmedOrders} ta
   🎯 <b>Bajarilgan:</b> ${stats.completedOrders} ta
   ❌ <b>Bekor qilingan:</b> ${stats.cancelledOrders} ta

🔄 <b>Oxirgi yangilanish:</b> ${stats.updatedAt.toLocaleString("uz-UZ", {
        timeZone: "Asia/Tashkent",
      })}
      `;

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback("📊 Batafsil", "detailed_stats"),
          Markup.button.callback("🔄 Yangilash", "refresh_stats"),
        ],
        [
          Markup.button.callback("📦 Buyurtmalar", "show_orders"),
          Markup.button.callback("📢 E'lon berish", "post_ad"),
        ],
        [Markup.button.callback("🔙 Bosh menyu", "admin_main")],
      ]);

      await ctx.reply(message, {
        parse_mode: "HTML",
        reply_markup: keyboard.reply_markup,
      });
    } catch (error) {
      console.error("Statistikani ko'rsatishda xatolik:", error);
      await ctx.reply("❌ Statistikani ko'rsatishda xatolik yuz berdi.");
    }
  }

  // Batafsil statistika
  async function showDetailedStatistics(ctx: MyContext) {
    try {
      const stats = await databaseService.getBotStatistics();

      if (!stats) {
        await ctx.reply("❌ Statistika ma'lumotlari topilmadi.");
        return;
      }

      const message = `
📊 <b>Batafsil statistika</b>

📅 <b>Oxirgi ma'lumotlar:</b>
   📊 <b>Jami foydalanuvchilar:</b> ${stats.totalUsers} ta
   📦 <b>Jami buyurtmalar:</b> ${stats.totalOrders} ta

📊 <b>Buyurtmalar holati:</b>
   ⏳ <b>Kutilayotgan:</b> ${stats.pendingOrders} ta
   ✅ <b>Tasdiqlangan:</b> ${stats.confirmedOrders} ta
   🎯 <b>Bajarilgan:</b> ${stats.completedOrders} ta
   ❌ <b>Bekor qilingan:</b> ${stats.cancelledOrders} ta

📈 <b>Statistika foizlari:</b>
   ✅ Bajarilish darajasi: ${stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
   ❌ Bekor qilish darajasi: ${stats.totalOrders > 0 ? Math.round((stats.cancelledOrders / stats.totalOrders) * 100) : 0}%

🔄 <b>Oxirgi yangilanish:</b> ${stats.updatedAt.toLocaleString("uz-UZ", {
        timeZone: "Asia/Tashkent",
      })}
      `;

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback("📊 Asosiy statistika", "main_stats"),
          Markup.button.callback("🔄 Yangilash", "refresh_detailed_stats"),
        ],
        [Markup.button.callback("🔙 Orqaga", "back_to_stats")],
      ]);

      await ctx.reply(message, {
        parse_mode: "HTML",
        reply_markup: keyboard.reply_markup,
      });
    } catch (error) {
      console.error("Batafsil statistikani ko'rsatishda xatolik:", error);
      await ctx.reply(
        "❌ Batafsil statistikani ko'rsatishda xatolik yuz berdi."
      );
    }
  }

  // ==================== KEYBOARD CREATION ====================

  // Buyurtmalar uchun tugmalar yaratish (pagination + buyurtma ID lar)
  function createOrdersKeyboard(
    currentPage: number,
    totalPages: number,
    orders: any[]
  ) {
    const keyboard = [];

    // Buyurtma tugmalari
    orders.forEach((order) => {
      keyboard.push([
        Markup.button.callback(
          `${order.orderNumber} - ${order.customerName}`,
          `order_${order.id}`
        ),
      ]);
    });

    // Pagination tugmalari
    if (totalPages > 1) {
      const paginationRow = [];

      if (currentPage > 1) {
        paginationRow.push(
          Markup.button.callback("⬅️ Oldingi", `page_${currentPage - 1}`)
        );
      }

      if (currentPage < totalPages) {
        paginationRow.push(
          Markup.button.callback("Keyingi ➡️", `page_${currentPage + 1}`)
        );
      }

      if (paginationRow.length > 0) {
        keyboard.push(paginationRow);
      }
    }

    // Boshqa tugmalar
    keyboard.push([
      Markup.button.callback("🔄 Yangilash", "refresh_orders"),
      Markup.button.callback("🔙 Bosh menyu", "admin_main"),
    ]);

    return Markup.inlineKeyboard(keyboard);
  }

  // Buyurtma ma'lumotlari uchun tugmalar
  function createOrderDetailsKeyboard(orderId: string, currentStatus: string) {
    const keyboard = [];

    // Holat yangilash tugmalari
    if (currentStatus !== "CONFIRMED") {
      keyboard.push([
        Markup.button.callback("✅ Tasdiqlash", `status_${orderId}_CONFIRMED`),
      ]);
    }

    if (currentStatus !== "COMPLETED") {
      keyboard.push([
        Markup.button.callback("🎯 Bajarildi", `status_${orderId}_COMPLETED`),
      ]);
    }

    if (currentStatus !== "CANCELLED") {
      keyboard.push([
        Markup.button.callback(
          "❌ Bekor qilish",
          `status_${orderId}_CANCELLED`
        ),
      ]);
    }

    // Navigatsiya tugmalari
    keyboard.push([
      Markup.button.callback("🔙 Buyurtmalarga qaytish", "back_to_orders"),
      Markup.button.callback("🏠 Bosh menyu", "admin_main"),
    ]);

    return Markup.inlineKeyboard(keyboard);
  }

  // Yordamchi funksiyalar - utils modulidan import qilingan
}
