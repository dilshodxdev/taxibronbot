import { Markup } from "telegraf";

export const fromRegionsKeyboard = () => Markup.inlineKeyboard([
  [
    Markup.button.callback("Toshkent shahri", "region_tashkent"),
    Markup.button.callback("Xorazm viloyati", "region_xorazm")
  ],
  [
    Markup.button.callback("Andijon viloyati", "region_andijon"),
    Markup.button.callback("Buxoro viloyati", "region_buxoro")
  ],
  [
    Markup.button.callback("Farg'ona viloyati", "region_fargona"),
    Markup.button.callback("Jizzax viloyati", "region_jizzax")
  ],
  [
    Markup.button.callback("Namangan viloyati", "region_namangan"),
    Markup.button.callback("Navoiy viloyati", "region_navoiy")
  ],
  [
    Markup.button.callback("Qashqadaryo viloyati", "region_qashqadaryo"),
    Markup.button.callback("Samarqand viloyati", "region_samarqand")
  ],
  [
    Markup.button.callback("Sirdaryo viloyati", "region_sirdaryo"),
    Markup.button.callback("Surxondaryo viloyati", "region_surxondaryo")
  ],
  [
    Markup.button.callback("🔙 Orqaga", "back_to_start")
  ]
]);
