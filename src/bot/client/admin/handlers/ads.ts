import { Scenes } from "telegraf";
import { MyContext } from "../../types/context";
import { DatabaseService } from "../../../../services/database";

// Database service ni olish
const databaseService = DatabaseService.getInstance();

// Matn olish uchun xavfsiz yordamchi funksiya
function getText(ctx: MyContext): string {
  if (ctx.message && "text" in ctx.message) {
    return ctx.message.text;
  }
  return "";
}

// E'lon berish scene - barcha mijozlarga xabar yuborish uchun
export const announcementScene = new Scenes.WizardScene<MyContext>(
  "ANNOUNCEMENT_SCENE",

  // 1-qadam: E'lon matnini so'rash
  async (ctx) => {
    // console.log("Announcement scene step 1 started"); // Debug uchun
    
    await ctx.reply("📢 E'lon matnini kiriting:");
    return ctx.wizard.next();
  },

  // 2-qadam: E'lon matnini qabul qilish va tasdiqlash
  async (ctx) => {
    // console.log("Announcement scene step 2 started"); // Debug uchun
    
    const announcementText = getText(ctx).trim();
    
    if (!announcementText || announcementText.length < 5) {
      await ctx.reply("❌ E'lon matni juda qisqa! Iltimos, kamida 5 ta belgi kiriting:");
      return ctx.wizard.selectStep(1);
    }

    ctx.scene.session.announcementText = announcementText;

    // E'lonni tasdiqlash uchun ko'rsatish
    const confirmationMessage = `
📢 <b>E'lon tasdiqlash</b>

<b>E'lon matni:</b>
${announcementText}

✅ E'lonni barcha mijozlarga yuborish uchun "Yuborish" tugmasini bosing.
❌ Bekor qilish uchun "Bekor qilish" tugmasini bosing.
    `;

    const confirmationKeyboard = {
      inline_keyboard: [
        [
          { text: "✅ Yuborish", callback_data: "confirm_announcement" },
          { text: "❌ Bekor qilish", callback_data: "cancel_announcement" }
        ]
      ]
    };

    await ctx.reply(confirmationMessage, {
      parse_mode: "HTML",
      reply_markup: confirmationKeyboard
    });
    
    return ctx.wizard.next();
  },

  // 3-qadam: Tasdiqlash callback ni qabul qilish
  async (ctx) => {
    // console.log("Announcement scene step 3 started"); // Debug uchun
    
    // Callback query ni tekshirish
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply("❌ Iltimos, tugmalardan birini bosing:");
      return ctx.wizard.selectStep(2);
    }

    const callbackData = ctx.callbackQuery.data;
    // console.log("Announcement callback data:", callbackData); // Debug uchun
    
    // Callback query ni javob berish
    await ctx.answerCbQuery();
    
    if (callbackData === "confirm_announcement") {
      // E'lonni barcha mijozlarga yuborish
      await sendAnnouncementToAllClients(ctx);
      return ctx.scene.leave();
      
    } else if (callbackData === "cancel_announcement") {
      // E'lonni bekor qilish
      await ctx.reply("❌ E'lon bekor qilindi.");
      return ctx.scene.leave();
    }
    
    return ctx.wizard.selectStep(2);
  }
);

// E'lonni barcha mijozlarga yuborish funksiyasi
async function sendAnnouncementToAllClients(ctx: MyContext) {
  try {
    const announcementText = ctx.scene.session.announcementText;
    
    if (!announcementText) {
      await ctx.reply("❌ E'lon matni topilmadi.");
      return;
    }

    // Barcha foydalanuvchilarni olish
    const allUsers = await databaseService.getAllUsers();
    
    if (allUsers.length === 0) {
      await ctx.reply("❌ Hech qanday mijoz topilmadi.");
      return;
    }

    // E'lon xabarini tayyorlash
    const announcementMessage = `
📢 <b>Muhim e'lon</b>

${announcementText}

<i>Taxi buyurtma qilish uchun /start buyrug'ini bering.</i>
    `;

    let successCount = 0;
    let errorCount = 0;

    // Har bir mijozga e'lonni yuborish
    for (const user of allUsers) {
      try {
        await ctx.telegram.sendMessage(user.telegramId, announcementMessage, {
          parse_mode: "HTML"
        });
        successCount++;
        
        // Telegram API limitlarini oshirmaslik uchun kichik kechikish
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`Error sending announcement to user ${user.telegramId}:`, error);
        errorCount++;
      }
    }

    // Natijani admin ga xabar berish
    const resultMessage = `
✅ <b>E'lon yuborildi!</b>

📊 <b>Natija:</b>
✅ Muvaffaqiyatli: ${successCount} ta mijoz
❌ Xatolik: ${errorCount} ta mijoz
📈 Jami: ${allUsers.length} ta mijoz

📢 <b>E'lon matni:</b>
${announcementText}
    `;

    await ctx.reply(resultMessage, { parse_mode: "HTML" });
    
  } catch (error) {
    console.error("Error in sendAnnouncementToAllClients:", error);
    await ctx.reply("❌ E'lon yuborishda xatolik yuz berdi.");
  }
}

// Yo'l qo'shish scene - mavjud funksiyani saqlash
export const addRouteScene = new Scenes.WizardScene<MyContext>(
  "ADD_ROUTE_SCENE",

  async (ctx) => {
    await ctx.reply("✏ Yo'nalishni kiriting (masalan: Toshkent - Samarqand):");
    return ctx.wizard.next();
  },

  async (ctx) => {
    ctx.scene.session.route = getText(ctx);
    await ctx.reply("⏰ Vaqtni kiriting (masalan: 15:00):");
    return ctx.wizard.next();
  },

  async (ctx) => {
    ctx.scene.session.time = getText(ctx);
    await ctx.reply("📱 Telefon raqamni kiriting (+998901234567):");
    return ctx.wizard.next();
  },

  async (ctx) => {
    ctx.scene.session.phone = getText(ctx);
    await ctx.reply("🚗 Mashina modelini kiriting (masalan: Nexia 3):");
    return ctx.wizard.next();
  },

  async (ctx) => {
    ctx.scene.session.car = getText(ctx);
    await ctx.reply("🎨 Rangini kiriting (masalan: Oq):");
    return ctx.wizard.next();
  },

  async (ctx) => {
    ctx.scene.session.color = getText(ctx);
    await ctx.reply(
      "ℹ Qo'shimcha ma'lumot kiriting (masalan: Bagaj bor yoki Yo'q):"
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    ctx.scene.session.extra = getText(ctx);

    const CHANNEL_ID = process.env.CHANNEL_ID;
    if (!CHANNEL_ID) {
      await ctx.reply("❗ Kanal ID topilmadi");
      return ctx.scene.leave();
    }

const announcement = `
📢 <b>Yangi taksi e'loni</b>

🚗 <b>Yo'nalish:</b> ${ctx.scene.session.route}
🕒 <b>Ketish vaqti:</b> ${ctx.scene.session.time}
🚘 <b>Mashina turi:</b> ${ctx.scene.session.car}
🎨 <b>Rangi:</b> ${ctx.scene.session.color}
ℹ <b>Qo'shimcha:</b> ${ctx.scene.session.extra}

📍 <b>Qo'ngiroq qilish:</b> <a href="tel:${ctx.scene.session.phone}">📞 ${ctx.scene.session.phone}</a>
📍 <b>Buyurtma qilish:</b> <a href="https://t.me/TaxibronBot">🧾 @TaxibronBot</a>
`;


    await ctx.telegram.sendMessage(CHANNEL_ID, announcement, {
      parse_mode: "HTML",
    });
    await ctx.reply("✅ E'lon kanalga yuborildi!");
    return ctx.scene.leave();
  }
);
