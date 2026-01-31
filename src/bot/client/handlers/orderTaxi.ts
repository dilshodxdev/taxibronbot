import { Scenes, Markup } from "telegraf";
import { MyContext } from "../types/context";
import { DatabaseService } from "../../../services/database";
import { logger } from "../../../services/logger";
import { formatPhone } from "../../../utils/utils";
import { CONFIG } from "../../../config";
import { tashkentDistrictsKeyboard } from "../keyboards/tashkentDistricts";
import { xorazmDistrictsKeyboard } from "../keyboards/xorazmDistricts";
import { fromRegionsKeyboard } from "../keyboards/fromRegions";
import { TASHKENT_DISTRICTS, XORAZM_DISTRICTS, REGIONS } from "./districtMap";

// Database service ni olish
const databaseService = DatabaseService.getInstance();

// Matn olish uchun xavfsiz yordamchi funksiya
function getText(ctx: MyContext): string {
  if (ctx.message && "text" in ctx.message) {
    return ctx.message.text;
  }
  return "";
}

// Taxi buyurtma wizard scene - foydalanuvchi buyurtma jarayonini to'liq boshqarish uchun
// Bu scene har bir qadamda foydalanuvchi kiritgan ma'lumotlarni to'g'ri qayta ishlaydi
export const orderTaxiScene = new Scenes.WizardScene<MyContext>(
  "ORDER_TAXI_SCENE",

  // 1-qadam: Yo'nalish tanlash - inline button lar bilan
  async (ctx) => {
    // console.log("Order taxi scene step 1 started"); // Debug uchun

    // Callback query kelgan bo'lsa, uni qayta ishlash
    if (ctx.callbackQuery && "data" in ctx.callbackQuery) {
      const routeData = ctx.callbackQuery.data;
      // console.log("Route callback received in step 1:", routeData); // Debug uchun

      // Callback query ni javob berish - bu Telegram loading indicator ni olib tashlaydi
      await ctx.answerCbQuery();

      // Yo'nalishni saqlash va tegishli tuman yoki viloyat tugmalarini ko'rsatish
      if (routeData === "route_tashkent_to_xorazm") {
        ctx.scene.session.direction = "tashkent_to_xorazm";
        ctx.scene.session.fromRegion = "Toshkent";
        ctx.scene.session.toRegion = "Xorazm";

        // Toshkent tumanlarini ko'rsatish - mavjud keyboard funksiyasini ishlatish
        const districtMessage =
          "🏙️ Toshkent viloyatidan qaysi tumanni tanlaysiz?";
        await ctx.reply(districtMessage, {
          reply_markup: tashkentDistrictsKeyboard().reply_markup,
        });
      } else if (routeData === "route_xorazm_to_tashkent") {
        ctx.scene.session.direction = "xorazm_to_tashkent";
        ctx.scene.session.fromRegion = "Xorazm";
        ctx.scene.session.toRegion = "Toshkent";

        // Xorazm tumanlarini ko'rsatish - mavjud keyboard funksiyasini ishlatish
        const districtMessage =
          "🏘️ Xorazm viloyatidan qaysi tumanni tanlaysiz?";
        await ctx.reply(districtMessage, {
          reply_markup: xorazmDistrictsKeyboard().reply_markup,
        });
      } else if (routeData === "route_other") {
        // Boshqa yo'nalish uchun viloyat tanlash
        ctx.scene.session.direction = "other";

        const regionMessage = "🌍 Qaysi viloyatdan ketasiz?";
        await ctx.reply(regionMessage, {
          reply_markup: fromRegionsKeyboard().reply_markup,
        });
      }

      // Keyingi qadamga o'tish
      return ctx.wizard.next();
    }

    // Agar callback query kelmagan bo'lsa, birinchi marta yo'nalish tanlash tugmalarini ko'rsatish
    // Scene session ni ishga tushirish
    ctx.scene.session.direction = undefined;
    ctx.scene.session.fromRegion = undefined;
    ctx.scene.session.fromDistrict = undefined;
    ctx.scene.session.toRegion = undefined;
    ctx.scene.session.toDistrict = undefined;

    const directionMessage = "Qaysi yo'nalishda sayohat qilmoqchisiz?";

    // Inline button lar bilan yo'nalish tanlash - ikonlar bilan
    const directionKeyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "🚖 Xorazm → Toshkent",
          "route_xorazm_to_tashkent"
        ),
        Markup.button.callback(
          "🚖 Toshkent → Xorazm",
          "route_tashkent_to_xorazm"
        ),
      ],
      [Markup.button.callback("🌍 Boshqa yo'nalish", "route_other")],
    ]);

    await ctx.reply(directionMessage, {
      reply_markup: directionKeyboard.reply_markup,
    });

    // Bu qadamda foydalanuvchi inline button ni bosadi, keyin keyingi qadamga o'tadi
    // ctx.wizard.next() ni chaqirmaymiz, chunki callback query kelguncha kutamiz
  },

  // 2-qadam: Tuman yoki viloyat callback ni qabul qilish
  async (ctx) => {
    // console.log("Order taxi scene step 2 started"); // Debug uchun

    // Callback query ni tekshirish
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
      await ctx.reply("❌ Iltimos, tugmalardan birini bosing:");
      return ctx.wizard.selectStep(0);
    }

    const callbackData = ctx.callbackQuery.data;
    // console.log("District/Region callback data:", callbackData); // Debug uchun

    // Callback query ni javob berish
    await ctx.answerCbQuery();

    // Region tanlash - boshqa yo'nalish uchun
    if (callbackData.startsWith("region_")) {
      const region = callbackData.replace("region_", "");
      // console.log("Region selected:", region); // Debug uchun

      if (region === "tashkent") {
        // Toshkent tumanlarini ko'rsatish
        const districtMessage =
          "🏙️ Toshkent viloyatidan qaysi tumanni tanlaysiz?";
        await ctx.reply(districtMessage, {
          reply_markup: tashkentDistrictsKeyboard().reply_markup,
        });
        return ctx.wizard.next();
      } else if (region === "xorazm") {
        // Xorazm tumanlarini ko'rsatish
        const districtMessage =
          "🏘️ Xorazm viloyatidan qaysi tumanni tanlaysiz?";
        await ctx.reply(districtMessage, {
          reply_markup: xorazmDistrictsKeyboard().reply_markup,
        });
        return ctx.wizard.next();
      } else {
        // Boshqa viloyatlar uchun
        ctx.scene.session.fromRegion = region;

        // Ikkinchi viloyatni tanlash
        const toRegionMessage = "🌍 Qayerga borasiz?";
        const toRegionKeyboard = createRegionKeyboard("to_region");

        await ctx.reply(toRegionMessage, {
          reply_markup: toRegionKeyboard.reply_markup,
        });
        return ctx.wizard.next();
      }
    }

    // Tuman tanlash - asosiy yo'nalishlar uchun
    if (ctx.scene.session.direction === "tashkent_to_xorazm") {
      // Toshkent tumanini tanlash
      if (callbackData.startsWith("tashkent_")) {
        const district = callbackData.replace("tashkent_", "");
        ctx.scene.session.fromDistrict = district;

        // Xorazm tumanlarini ko'rsatish
        const toDistrictMessage =
          "🏘️ Xorazm viloyatidan qaysi tumanni tanlaysiz?";
        const toDistrictKeyboard = createDistrictKeyboard(
          XORAZM_DISTRICTS,
          "xorazm"
        );

        await ctx.reply(toDistrictMessage, {
          reply_markup: toDistrictKeyboard.reply_markup,
        });
      }
    } else if (ctx.scene.session.direction === "xorazm_to_tashkent") {
      // Xorazm tumanini tanlash
      if (callbackData.startsWith("xorazm_")) {
        const district = callbackData.replace("xorazm_", "");
        ctx.scene.session.fromDistrict = district;

        // Toshkent tumanlarini ko'rsatish
        const toDistrictMessage =
          "🏙️ Toshkent viloyatidan qaysi tumanni tanlaysiz?";
        const toDistrictKeyboard = createDistrictKeyboard(
          TASHKENT_DISTRICTS,
          "tashkent"
        );

        await ctx.reply(toDistrictMessage, {
          reply_markup: toDistrictKeyboard.reply_markup,
        });
      }
    }

    // Keyingi qadamga o'tish
    return ctx.wizard.next();
  },

  // 3-qadam: Ikkinchi tuman yoki viloyat callback ni qabul qilish
  async (ctx) => {
    // console.log("Order taxi scene step 3 started");

    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
      await ctx.reply("❌ Iltimos, tugmalardan birini bosing:");
      return ctx.wizard.selectStep(1);
    }

    const callbackData = ctx.callbackQuery.data;
    // console.log("Second district/region callback data:", callbackData);

    await ctx.answerCbQuery();

    // direction ga qarab tuman va viloyatlarni to'g'ri o'rnatish
    if (ctx.scene.session.direction === "tashkent_to_xorazm") {
      // Agar Toshkent → Xorazm yo'nalishi bo'lsa
      if (callbackData.startsWith("tashkent_")) {
        // fromDistrict va fromRegion - Toshkent
        const district = callbackData.replace("tashkent_", "");
        ctx.scene.session.fromDistrict = district;
        ctx.scene.session.fromRegion = "Toshkent";
      } else if (callbackData.startsWith("xorazm_")) {
        // toDistrict - Xorazm
        const district = callbackData.replace("xorazm_", "");
        ctx.scene.session.toDistrict = district;
        ctx.scene.session.toRegion = "Xorazm";
      }
    } else if (ctx.scene.session.direction === "xorazm_to_tashkent") {
      // Agar Xorazm → Toshkent yo'nalishi bo'lsa
      if (callbackData.startsWith("xorazm_")) {
        // fromDistrict va fromRegion - Xorazm
        const district = callbackData.replace("xorazm_", "");
        ctx.scene.session.fromDistrict = district;
        ctx.scene.session.fromRegion = "Xorazm";
      } else if (callbackData.startsWith("tashkent_")) {
        // toDistrict - Toshkent
        const district = callbackData.replace("tashkent_", "");
        ctx.scene.session.toDistrict = district;
        ctx.scene.session.toRegion = "Toshkent";
      }
    } else {
      // Boshqa yo'nalish (other) uchun toRegion tanlash
      if (callbackData.startsWith("to_region_")) {
        const region = callbackData.replace("to_region_", "");
        ctx.scene.session.toRegion = region;
      }
    }

    // To'liq ism so'rashga o'tamiz
    await ctx.reply("👤 Iltimos, to'liq ismingizni kiriting:");
    return ctx.wizard.next();
  },

  // 4-qadam: To'liq ism qabul qilish
  async (ctx) => {
    // console.log("Order taxi scene step 4 started"); // Debug uchun

    const fullName = getText(ctx).trim();

    if (!fullName || fullName.length < 2) {
      await ctx.reply(
        "❌ Ism juda qisqa! Iltimos, to'liq ismingizni kiriting:"
      );
      return ctx.wizard.selectStep(3);
    }

    ctx.scene.session.fullName = fullName;

    // Telefon raqam so'rash - text yoki contact button bilan
    const phoneMessage =
      "📞 Iltimos, telefon raqamingizni kiriting (+998901234567):";

    // Contact button reply keyboard da ishlatiladi, inline keyboard da emas
    const phoneKeyboard = Markup.keyboard([
      [Markup.button.contactRequest("📱 Kontakt yuborish")],
    ]).resize();

    await ctx.reply(phoneMessage, {
      reply_markup: phoneKeyboard.reply_markup,
    });
    return ctx.wizard.next();
  },

  // 5-qadam: Telefon raqam qabul qilish
  async (ctx) => {
    // console.log("Order taxi scene step 5 started"); // Debug uchun

    let phone = "";

    // Contact yuborilgan bo'lsa
    if (ctx.message && "contact" in ctx.message && ctx.message.contact) {
      phone = ctx.message.contact.phone_number;
    } else {
      // Text sifatida kiritilgan bo'lsa
      phone = getText(ctx).trim();
    }

    // Telefon raqamini tekshirish va formatlash
    if (!isValidPhone(phone)) {
      await ctx.reply(
        "❌ Noto'g'ri telefon raqam! Iltimos, to'g'ri formatda kiriting (+998901234567):"
      );
      return ctx.wizard.selectStep(4);
    }

    ctx.scene.session.phone = phone;

    // Buyurtma xulosasini ko'rsatish
    await showOrderSummary(ctx);
    return ctx.scene.leave();
  }
);

// Yordamchi funksiyalar

// Tuman tugmalarini yaratish
function createDistrictKeyboard(districts: string[], prefix: string) {
  const buttons = [];

  // Har 2 ta tuman bir qatorda
  for (let i = 0; i < districts.length; i += 2) {
    const row = [
      Markup.button.callback(districts[i], `${prefix}_${districts[i]}`),
    ];

    if (i + 1 < districts.length) {
      row.push(
        Markup.button.callback(
          districts[i + 1],
          `${prefix}_${districts[i + 1]}`
        )
      );
    }

    buttons.push(row);
  }

  // "Boshqa tuman" tugmasi
  buttons.push([Markup.button.callback("Boshqa tuman", `${prefix}_other`)]);

  return Markup.inlineKeyboard(buttons);
}

// Viloyat tugmalarini yaratish
function createRegionKeyboard(prefix: string) {
  const buttons = [];

  // Har 2 ta viloyat bir qatorda
  for (let i = 0; i < REGIONS.length; i += 2) {
    const row = [Markup.button.callback(REGIONS[i], `${prefix}_${REGIONS[i]}`)];

    if (i + 1 < REGIONS.length) {
      row.push(
        Markup.button.callback(REGIONS[i + 1], `${prefix}_${REGIONS[i + 1]}`)
      );
    }

    buttons.push(row);
  }

  return Markup.inlineKeyboard(buttons);
}

// Telefon raqamini tekshirish - to'g'rilangan versiya
function isValidPhone(phone: string): boolean {
  return formatPhone(phone) !== null;
}

// Buyurtma xulosasini ko'rsatish va saqlash
async function showOrderSummary(ctx: MyContext) {
  const session = ctx.scene.session;

  // Foydalanuvchini ma'lumotlar bazasida yaratish yoki yangilash
  if (ctx.from?.id && session.fullName && session.phone) {
    await databaseService.upsertUser(ctx.from.id.toString(), {
      username: ctx.from.username,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
      fullName: session.fullName,
      phone: session.phone,
      languageCode: ctx.from.language_code,
    });
  }

  // Foydalanuvchi ma'lumotlarini olish
  let user = null;

  if (ctx.from?.id) {
    user = await databaseService.getUserByTelegramId(ctx.from.id.toString());
  }

  if (!user) {
    await ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi.");
    return;
  }

  // Buyurtma yaratish - barcha majburiy maydonlar mavjudligini tekshirish

  // Debug uchun
  // console.log(
  //   session.direction,
  //   session.fromRegion,
  //   session.fromDistrict,
  //   session.toRegion,
  //   session.toDistrict,
  //   session.fullName,
  //   session.phone
  // );

  if (
    !session.fromRegion ||
    !session.toRegion ||
    !session.fullName ||
    !session.phone
  ) {
    // Bosh menyuga qaytish
    const mainMenuKeyboard = Markup.keyboard([
      ["🚕 Taksi buyurtma qilish"],
      ["👤 Operator bilan bog'lanish"],
      ["🧾 Mening buyurtmalarim", "ℹ️ Yordam"],
    ]).resize();

    await ctx.reply(
      "❌ Buyurtma ma'lumotlari to'liq emas. Iltimos, qaytadan urinib ko'ring...",
      {
        reply_markup: mainMenuKeyboard.reply_markup,
      }
    );

    return;
  }

  const order = await databaseService.createOrder({
    userId: user.id,
    fromRegion: session.fromRegion,
    fromDistrict: session.fromDistrict,
    toRegion: session.toRegion,
    toDistrict: session.toDistrict,
    customerName: session.fullName,
    customerPhone: session.phone,
  });

  if (!order) {
    await ctx.reply("❌ Buyurtma yaratishda xatolik yuz berdi.");
    return;
  }

  // Foydalanuvchiga buyurtma xulosasini yuborish
  const summary = `
✅ <b>Buyurtma qabul qilindi!</b>

🆔 <b>Buyurtma raqami:</b> ${order.orderNumber}
👤 <b>Ism:</b> ${session.fullName}
📞 <b>Telefon:</b> ${session.phone}
📍 <b>Yo'nalish:</b> ${session.fromRegion}${session.fromDistrict ? ` - ${session.fromDistrict}` : ""
    } → ${session.toRegion}${session.toDistrict ? ` - ${session.toDistrict}` : ""}
⏰ <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
    })}
📊 <b>Holat:</b> ⏳ Kutilmoqda

✅ Buyurtmangiz qabul qilindi! Tez orada siz bilan bog'lanishadi.
  `;

  await ctx.reply(summary, { parse_mode: "HTML" });

  // Adminga xabar jo'natish  //////////////////////////////////////////////////////////////////

  const adminId = CONFIG.ADMIN_ID;

  if (adminId) {
    let phone = session.phone?.replace(/\D/g, "") || "";

    // Bo'sh joy va tirelarni olib tashlash
    phone = phone.replace(/\s|-/g, "");

    // Agar faqat 9 ta raqam bo'lsa, 998 qo'shish
    if (/^\d{9}$/.test(phone)) {
      phone = `998${phone}`;
    }

    const telegramLink = ctx.from?.id ? `tg://user?id=${ctx.from.id}` : null;

    const adminMessage = `
📢 <b>Yangi buyurtma!</b>
🆔 <b>Buyurtma raqami:</b> ${order.orderNumber}
⏰ <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
    })}

👤 <b>Mijoz:</b> ${session.fullName || "—"}
📞 ${phone ? `+${phone}` : "—"}

📍 <b>Yo'nalish:</b> ${session.fromRegion || "—"}${session.fromDistrict ? ` - ${session.fromDistrict}` : ""
      }
 → ${session.toRegion || "—"}${session.toDistrict ? ` - ${session.toDistrict}` : ""
      }
`;

    const inlineKeyboard: any[] = [];

    if (phone) {
      inlineKeyboard.push([
        { text: `📞 +${phone}`, callback_data: `show_number_${phone}` },
      ]);
    }

    if (telegramLink) {
      inlineKeyboard.push([
        { text: "💬 Telegram’da yozish", url: telegramLink },
      ]);
    }

    await ctx.telegram.sendMessage(adminId, adminMessage, {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: inlineKeyboard },
    });
  }

  // Adminga xabar jo'natish yakunlandi

  // Yakuniy xabar - operatorimiz siz bilan tez orada bog'lanadi
  await ctx.reply("Operatorimiz siz bilan tez orada bog'lanadi.");

  // Bosh menyuga qaytish
  const mainMenuKeyboard = Markup.keyboard([
    ["🚕 Taksi buyurtma qilish"],
    ["👤 Operator bilan bog'lanish"],
    ["🧾 Mening buyurtmalarim", "ℹ️ Yordam"],
  ]).resize();

  await ctx.reply("🏠 Bosh menyuga qaytish uchun /start buyrug'ini bering.", {
    reply_markup: mainMenuKeyboard.reply_markup,
  });
}
