"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminStart = void 0;
const telegraf_1 = require("telegraf");
const AdminStart = () => {
    return telegraf_1.Markup.keyboard([
        ["📦 Buyurtmalar ", "📢 E'lon berish"],
        ["📊 Statistika"],
    ]).resize();
};
exports.AdminStart = AdminStart;
