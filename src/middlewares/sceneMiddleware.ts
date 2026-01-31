import { Markup } from "telegraf";
import { MyContext } from "../bot/client/types/context";
import { logger } from "../services/logger";

// Scene nomlarini ro'yxati
const SCENE_NAMES: Record<string, string> = {
    ORDER_TAXI_SCENE: "taksi buyurtma qilish",
    ANNOUNCEMENT_SCENE: "e'lon berish",
    ADD_ROUTE_SCENE: "yo'l qo'shish",
};

// Bosh menyu tugmalari ro'yxati - bularni bosganida tasdiqlash so'raladi
const MENU_BUTTONS = [
    "🚕 Taksi buyurtma qilish",
    "👤 Operator bilan bog'lanish",
    "🧾 Mening buyurtmalarim",
    "ℹ️ Yordam",
    "📦 Buyurtmalar",
    "📊 Statistika",
    "📢 E'lon berish",
];

// Tasdiqlash kutayotgan foydalanuvchilar
const pendingConfirmations = new Map<number, string>();

/**
 * Scene interruption middleware
 * Foydalanuvchi scene ichida boshqa tugmani bosganida tasdiqlash so'raydi
 */
export function sceneInterruptionMiddleware() {
    return async (ctx: MyContext, next: () => Promise<void>) => {
        // Faqat text xabarlar uchun
        if (!ctx.message || !("text" in ctx.message)) {
            return next();
        }

        const text = ctx.message.text;
        const userId = ctx.from?.id;

        if (!userId) {
            return next();
        }

        // Agar tasdiqlash kutayotgan bo'lsa
        if (pendingConfirmations.has(userId)) {
            // Bu holda callback handler ishlaydi, boshqa narsa qilmaymiz
            return next();
        }

        // Session dan wizard scene borligini tekshirish
        // Telegraf wizard scene ishlaganda session __scenes obyektida current saqlanadi
        const session = (ctx as any).session;
        const currentScene = session?.__scenes?.current;

        if (!currentScene) {
            return next();
        }

        // Agar foydalanuvchi menyu tugmasini bosgan bo'lsa
        if (MENU_BUTTONS.includes(text) || text.startsWith("/")) {
            const sceneName = SCENE_NAMES[currentScene] || currentScene;

            // Tasdiqlash so'rovi yuborish
            pendingConfirmations.set(userId, currentScene);

            const confirmMessage = `⚠️ <b>Siz hozir ${sceneName} jarayonidasiz.</b>

To'xtatamizmi yoki davom etamizmi?`;

            const confirmKeyboard = Markup.inlineKeyboard([
                [
                    Markup.button.callback("❌ To'xtatish", "scene_stop"),
                    Markup.button.callback("✅ Davom etish", "scene_continue"),
                ],
            ]);

            await ctx.reply(confirmMessage, {
                parse_mode: "HTML",
                ...confirmKeyboard,
            });

            logger.info(`Scene interruption requested: ${currentScene}`, "SceneMiddleware", { userId });
            return; // next() ni chaqirmaymiz - bu xabar qayta ishlanmaydi
        }

        return next();
    };
}

/**
 * Scene interruption callback handler
 * "To'xtatish" va "Davom etish" tugmalarini qayta ishlaydi
 */
export function setupSceneInterruptionHandler(bot: any) {
    // To'xtatish tugmasi
    bot.action("scene_stop", async (ctx: MyContext) => {
        const userId = ctx.from?.id;

        if (!userId) {
            await ctx.answerCbQuery("❌ Xatolik yuz berdi");
            return;
        }

        // Tasdiqlash ro'yxatidan o'chirish
        pendingConfirmations.delete(userId);

        await ctx.answerCbQuery("❌ To'xtatildi");

        // Scene ni tark etish
        await ctx.scene.leave();

        // Bosh menyu ko'rsatish
        const mainMenuKeyboard = Markup.keyboard([
            ["🚕 Taksi buyurtma qilish"],
            ["👤 Operator bilan bog'lanish"],
            ["🧾 Mening buyurtmalarim", "ℹ️ Yordam"],
        ]).resize();

        await ctx.reply("🏠 Bosh menyuga qaytdingiz.", {
            reply_markup: mainMenuKeyboard.reply_markup,
        });

        logger.info("Scene stopped by user", "SceneMiddleware", { userId });
    });

    // Davom etish tugmasi
    bot.action("scene_continue", async (ctx: MyContext) => {
        const userId = ctx.from?.id;

        if (!userId) {
            await ctx.answerCbQuery("❌ Xatolik yuz berdi");
            return;
        }

        const sceneName = pendingConfirmations.get(userId);

        // Tasdiqlash ro'yxatidan o'chirish
        pendingConfirmations.delete(userId);

        await ctx.answerCbQuery("✅ Davom etamiz");

        // Foydalanuvchiga davom etish haqida xabar berish
        await ctx.reply("✅ Davom eting...");

        logger.info(`Scene continued: ${sceneName}`, "SceneMiddleware", { userId });
    });
}
