import { Markup } from "telegraf";

export const tashkentDistrictsKeyboard = () => Markup.inlineKeyboard([
  [
    Markup.button.callback("Bektemir tumani", "tashkent_bektemir"),
    Markup.button.callback("Chilanzor tumani", "tashkent_chilanzor")
  ],
  [
    Markup.button.callback("Yashnobod tumani", "tashkent_yashnobod"),
    Markup.button.callback("Mirobod tumani", "tashkent_mirobod")
  ],
  [
    Markup.button.callback("Olmazor tumani", "tashkent_olmazor"),
    Markup.button.callback("Sirg'ali tumani", "tashkent_sirgali")
  ],
  [
    Markup.button.callback("Uchtepa tumani", "tashkent_uchtepa"),
    Markup.button.callback("Shayxontohur tumani", "tashkent_shayxontohur")
  ],
  [
    Markup.button.callback("Yunusobod tumani", "tashkent_yunusobod"),
    Markup.button.callback("Yakkasaroy tumani", "tashkent_yakkasaroy")
  ],
  [
    Markup.button.callback("🔙 Orqaga", "back_to_regions")
  ]
]);