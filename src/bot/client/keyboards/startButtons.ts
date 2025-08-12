import { Markup } from "telegraf";

export const startButtonsKeyboard = () => Markup.inlineKeyboard([
  [
    Markup.button.callback("🚗 Taksi chaqirish", "order_taxi"),
    Markup.button.callback("📍 Hududni tanlash", "select_region")
  ],
  [
    Markup.button.callback("ℹ️ Ma'lumot", "info"),
    Markup.button.callback("📞 Aloqa", "contact")
  ],
  [
    Markup.button.callback("🔙 Orqaga", "back_to_start")
  ]
]);
