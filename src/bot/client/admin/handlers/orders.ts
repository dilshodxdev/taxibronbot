import { Markup } from "telegraf";
import { MyContext } from "../../types/context";
import { OrderStorageService } from "../../services/orderStorage";

// Buyurtmalarni ko'rish uchun handler
// Avvalgi versiyada buyurtmalar ko'rsatilmasdi
// Yangi versiyada buyurtmalar pagination bilan ko'rsatiladi (5 tadan)
export class OrdersHandler {
  private static orderStorage = OrderStorageService.getInstance();

  // Buyurtmalar ro'yxatini ko'rsatish
  static async showOrders(ctx: MyContext, page: number = 1): Promise<void> {
    const { orders, total, totalPages, currentPage } = this.orderStorage.getOrders(page, 5);
    
    if (total === 0) {
      await ctx.reply("📦 Hozircha buyurtmalar yo'q.");
      return;
    }

    // Admin session ni yangilash
    if (!ctx.adminSession) {
      ctx.adminSession = {
        currentPage: 1,
        ordersPerPage: 5,
        totalOrders: total
      };
    }
    ctx.adminSession.currentPage = currentPage;
    ctx.adminSession.totalOrders = total;

    let message = `📦 <b>Buyurtmalar ro'yxati</b>\n\n`;
    message += `📊 <b>Jami:</b> ${total} ta buyurtma\n`;
    message += `📄 <b>Sahifa:</b> ${currentPage}/${totalPages}\n\n`;

    // Har bir buyurtmani ko'rsatish
    orders.forEach((order, index) => {
      const orderNumber = (currentPage - 1) * 5 + index + 1;
      const statusEmoji = this.getStatusEmoji(order.status);
      const time = order.timestamp.toLocaleString("uz-UZ", {
        timeZone: "Asia/Tashkent",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      message += `${orderNumber}. ${statusEmoji} <b>${order.id}</b>\n`;
      message += `👤 <b>Ism:</b> ${order.customerName || "—"}\n`;
      message += `📞 <b>Telefon:</b> ${order.customerPhone || "—"}\n`;
      message += `📍 <b>Yo'nalish:</b> ${order.fromRegion || "—"} → ${order.toRegion || "—"}\n`;
      message += `⏰ <b>Vaqt:</b> ${time}\n`;
      message += `📊 <b>Holat:</b> ${this.getStatusText(order.status)}\n\n`;
    });

    // Pagination tugmalari va buyurtma ID tugmalari
    const keyboard = this.createOrdersKeyboard(currentPage, totalPages, orders);
    
    await ctx.reply(message, {
      parse_mode: "HTML",
      reply_markup: keyboard.reply_markup
    });
  }

  // Buyurtma holatini yangilash
  static async updateOrderStatus(ctx: MyContext, orderId: string, newStatus: string): Promise<void> {
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      await ctx.reply("❗ Noto'g'ri holat. Ruxsat etilgan holatlar: pending, confirmed, completed, cancelled");
      return;
    }

    const success = this.orderStorage.updateOrderStatus(orderId, newStatus as any);
    
    if (success) {
      await ctx.reply(`✅ Buyurtma ${orderId} holati "${this.getStatusText(newStatus as any)}" ga yangilandi.`);
    } else {
      await ctx.reply("❌ Buyurtma topilmadi yoki yangilashda xatolik yuz berdi.");
    }
  }

  // Buyurtma ma'lumotlarini batafsil ko'rsatish
  static async showOrderDetails(ctx: MyContext, orderId: string): Promise<void> {
    const order = this.orderStorage.getOrderById(orderId);
    
    if (!order) {
      await ctx.reply("❌ Buyurtma topilmadi.");
      return;
    }

    const time = order.timestamp.toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const message = `
📋 <b>Buyurtma ma'lumotlari</b>

🆔 <b>ID:</b> ${order.id}
👤 <b>Ism:</b> ${order.customerName || "—"}
📞 <b>Telefon:</b> ${order.customerPhone || "—"}
👥 <b>Foydalanuvchi ID:</b> ${order.userId}
⏰ <b>Vaqt:</b> ${time}
📊 <b>Holat:</b> ${this.getStatusText(order.status)}

📍 <b>Yo'nalish</b>:
   🏁 <b>Qayerdan:</b> ${order.fromRegion || "—"} — ${order.fromDistrict || "—"}
   🎯 <b>Qayerga:</b> ${order.toRegion || "—"} — ${order.toDistrict || "—"}
    `;

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback("✅ Tasdiqlash", `status_${order.id}_confirmed`),
        Markup.button.callback("✅ Bajarildi", `status_${order.id}_completed`)
      ],
      [
        Markup.button.callback("❌ Bekor qilish", `status_${order.id}_cancelled`),
        Markup.button.callback("🔄 Qayta ko'rish", `status_${order.id}_pending`)
      ],
      [Markup.button.callback("🔙 Orqaga", "back_to_orders")]
    ]);

    await ctx.reply(message, {
      parse_mode: "HTML",
      reply_markup: keyboard.reply_markup
    });
  }

  // Pagination tugmalarini yaratish
  private static createPaginationKeyboard(currentPage: number, totalPages: number): ReturnType<typeof Markup.inlineKeyboard> {
    const keyboard = [];

    // Sahifa navigatsiyasi
    if (totalPages > 1) {
      const navigationRow = [];
      
      if (currentPage > 1) {
        navigationRow.push(Markup.button.callback("⬅️ Oldingi", `page_${currentPage - 1}`));
      }
      
      if (currentPage < totalPages) {
        navigationRow.push(Markup.button.callback("Keyingi ➡️", `page_${currentPage + 1}`));
      }
      
      if (navigationRow.length > 0) {
        keyboard.push(navigationRow);
      }
    }

    // Boshqa tugmalar
    keyboard.push([
      Markup.button.callback("🔄 Yangilash", "refresh_orders"),
      Markup.button.callback("🔙 Bosh menyu", "admin_main")
    ]);

    return Markup.inlineKeyboard(keyboard);
  }

  // Buyurtmalar uchun tugmalar yaratish (pagination + buyurtma ID lar)
  private static createOrdersKeyboard(currentPage: number, totalPages: number, orders: any[]): ReturnType<typeof Markup.inlineKeyboard> {
    const keyboard = [];

    // Har bir buyurtma uchun ID tugmasi
    orders.forEach(order => {
      keyboard.push([
        Markup.button.callback(`📋 ${order.id}`, `order_${order.id}`)
      ]);
    });

    // Sahifa navigatsiyasi
    if (totalPages > 1) {
      const navigationRow = [];
      
      if (currentPage > 1) {
        navigationRow.push(Markup.button.callback("⬅️ Oldingi", `page_${currentPage - 1}`));
      }
      
      if (currentPage < totalPages) {
        navigationRow.push(Markup.button.callback("Keyingi ➡️", `page_${currentPage + 1}`));
      }
      
      if (navigationRow.length > 0) {
        keyboard.push(navigationRow);
      }
    }

    // Boshqa tugmalar
    keyboard.push([
      Markup.button.callback("🔄 Yangilash", "refresh_orders"),
      Markup.button.callback("🔙 Bosh menyu", "admin_main")
    ]);

    return Markup.inlineKeyboard(keyboard);
  }

  // Holat emoji sini olish
  private static getStatusEmoji(status: string): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  }

  // Holat matnini olish
  private static getStatusText(status: string): string {
    switch (status) {
      case 'pending': return '⏳ Kutilmoqda';
      case 'confirmed': return '✅ Tasdiqlangan';
      case 'completed': return '🎉 Bajarilgan';
      case 'cancelled': return '❌ Bekor qilingan';
      default: return '❓ Noma\'lum';
    }
  }
} 