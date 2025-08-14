"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startButtonsKeyboard = void 0;
const telegraf_1 = require("telegraf");
const startButtonsKeyboard = () => telegraf_1.Markup.inlineKeyboard([
    [
        telegraf_1.Markup.button.callback("🚗 Taksi chaqirish", "order_taxi"),
        telegraf_1.Markup.button.callback("📍 Hududni tanlash", "select_region")
    ],
    [
        telegraf_1.Markup.button.callback("ℹ️ Ma'lumot", "info"),
        telegraf_1.Markup.button.callback("📞 Aloqa", "contact")
    ],
    [
        telegraf_1.Markup.button.callback("🔙 Orqaga", "back_to_start")
    ]
]);
exports.startButtonsKeyboard = startButtonsKeyboard;
