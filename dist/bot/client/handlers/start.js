"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStart = void 0;
const startButtons_1 = require("../keyboards/startButtons");
const handleStart = (ctx) => {
    ctx.reply("Assalomu alaykum! Taxi bron bot ga xush kelibsiz. Quyidagi tugmalar orqali kerakli xizmatni tanlang 👇", { reply_markup: (0, startButtons_1.startButtonsKeyboard)().reply_markup });
};
exports.handleStart = handleStart;
