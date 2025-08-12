import { Markup } from "telegraf";

export const fromDistrictsKeyboard = () => Markup.inlineKeyboard([
  [
    Markup.button.callback("Toshkent shahri", "from_region_tashkent"),
    Markup.button.callback("Xorazm viloyati", "from_region_xorazm")
  ],
  [
    Markup.button.callback("Boshqa viloyat", "from_region_other")
  ],
  [
    Markup.button.callback("🔙 Orqaga", "back_to_start")
  ]
]);
