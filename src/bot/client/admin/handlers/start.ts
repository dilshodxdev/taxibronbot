import { Markup } from "telegraf";

export const AdminStart = () => {
  return Markup.keyboard([
    ["📦 Buyurtmalar ", "📢 E'lon berish"],
    ["📊 Statistika"],
  ]).resize();
};
