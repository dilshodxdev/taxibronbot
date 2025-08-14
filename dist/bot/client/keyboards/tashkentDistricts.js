"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tashkentDistrictsKeyboard = void 0;
const telegraf_1 = require("telegraf");
const tashkentDistrictsKeyboard = () => telegraf_1.Markup.inlineKeyboard([
    [
        telegraf_1.Markup.button.callback("Bektemir tumani", "tashkent_bektemir"),
        telegraf_1.Markup.button.callback("Chilanzor tumani", "tashkent_chilanzor")
    ],
    [
        telegraf_1.Markup.button.callback("Yashnobod tumani", "tashkent_yashnobod"),
        telegraf_1.Markup.button.callback("Mirobod tumani", "tashkent_mirobod")
    ],
    [
        telegraf_1.Markup.button.callback("Olmazor tumani", "tashkent_olmazor"),
        telegraf_1.Markup.button.callback("Sirg'ali tumani", "tashkent_sirgali")
    ],
    [
        telegraf_1.Markup.button.callback("Uchtepa tumani", "tashkent_uchtepa"),
        telegraf_1.Markup.button.callback("Shayxontohur tumani", "tashkent_shayxontohur")
    ],
    [
        telegraf_1.Markup.button.callback("Yunusobod tumani", "tashkent_yunusobod"),
        telegraf_1.Markup.button.callback("Yakkasaroy tumani", "tashkent_yakkasaroy")
    ],
    [
        telegraf_1.Markup.button.callback("🔙 Orqaga", "back_to_regions")
    ]
]);
exports.tashkentDistrictsKeyboard = tashkentDistrictsKeyboard;
