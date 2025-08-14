"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xorazmDistrictsKeyboard = void 0;
const telegraf_1 = require("telegraf");
const xorazmDistrictsKeyboard = () => telegraf_1.Markup.inlineKeyboard([
    [
        telegraf_1.Markup.button.callback("Urganch tumani", "xorazm_urganch"),
        telegraf_1.Markup.button.callback("Xonqa tumani", "xorazm_xonqa")
    ],
    [
        telegraf_1.Markup.button.callback("Xiva tumani", "xorazm_xiva"),
        telegraf_1.Markup.button.callback("Shovot tumani", "xorazm_shovot")
    ],
    [
        telegraf_1.Markup.button.callback("Hazorasp tumani", "xorazm_hazorasp"),
        telegraf_1.Markup.button.callback("Qo'shko'pir tumani", "xorazm_qoshkopir")
    ],
    [
        telegraf_1.Markup.button.callback("Bog'ot tumani", "xorazm_bogot"),
        telegraf_1.Markup.button.callback("Gurlan tumani", "xorazm_gurlan")
    ],
    [
        telegraf_1.Markup.button.callback("Yangiariq tumani", "xorazm_yangiariq"),
        telegraf_1.Markup.button.callback("Yangibozor tumani", "xorazm_yangibozor")
    ],
    [
        telegraf_1.Markup.button.callback("Tuproqqal'a tumani", "xorazm_tuproqqala")
    ],
    [
        telegraf_1.Markup.button.callback("🔙 Orqaga", "back_to_regions")
    ]
]);
exports.xorazmDistrictsKeyboard = xorazmDistrictsKeyboard;
