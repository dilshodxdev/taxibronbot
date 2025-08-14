"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromRegionsKeyboard = void 0;
const telegraf_1 = require("telegraf");
const fromRegionsKeyboard = () => telegraf_1.Markup.inlineKeyboard([
    [
        telegraf_1.Markup.button.callback("Toshkent shahri", "region_tashkent"),
        telegraf_1.Markup.button.callback("Xorazm viloyati", "region_xorazm")
    ],
    [
        telegraf_1.Markup.button.callback("Andijon viloyati", "region_andijon"),
        telegraf_1.Markup.button.callback("Buxoro viloyati", "region_buxoro")
    ],
    [
        telegraf_1.Markup.button.callback("Farg'ona viloyati", "region_fargona"),
        telegraf_1.Markup.button.callback("Jizzax viloyati", "region_jizzax")
    ],
    [
        telegraf_1.Markup.button.callback("Namangan viloyati", "region_namangan"),
        telegraf_1.Markup.button.callback("Navoiy viloyati", "region_navoiy")
    ],
    [
        telegraf_1.Markup.button.callback("Qashqadaryo viloyati", "region_qashqadaryo"),
        telegraf_1.Markup.button.callback("Samarqand viloyati", "region_samarqand")
    ],
    [
        telegraf_1.Markup.button.callback("Sirdaryo viloyati", "region_sirdaryo"),
        telegraf_1.Markup.button.callback("Surxondaryo viloyati", "region_surxondaryo")
    ],
    [
        telegraf_1.Markup.button.callback("🔙 Orqaga", "back_to_start")
    ]
]);
exports.fromRegionsKeyboard = fromRegionsKeyboard;
