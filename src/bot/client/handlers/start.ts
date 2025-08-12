import { Context } from "telegraf";
import { startButtonsKeyboard } from "../keyboards/startButtons";

export const handleStart = (ctx: Context) => {
  ctx.reply(
    "Assalomu alaykum! Taxi bron bot ga xush kelibsiz. Quyidagi tugmalar orqali kerakli xizmatni tanlang 👇",
    { reply_markup: startButtonsKeyboard().reply_markup }
  );
};
