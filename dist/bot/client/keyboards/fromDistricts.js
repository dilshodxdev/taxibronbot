"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromDistrictsKeyboard = void 0;
const telegraf_1 = require("telegraf");
const fromDistrictsKeyboard = () => telegraf_1.Markup.inlineKeyboard([
    [
        telegraf_1.Markup.button.callback("Toshkent shahri", "from_region_tashkent"),
        telegraf_1.Markup.button.callback("Xorazm viloyati", "from_region_xorazm")
    ],
    [
        telegraf_1.Markup.button.callback("Boshqa viloyat", "from_region_other")
    ],
    [
        telegraf_1.Markup.button.callback("🔙 Orqaga", "back_to_start")
    ]
]);
exports.fromDistrictsKeyboard = fromDistrictsKeyboard;
