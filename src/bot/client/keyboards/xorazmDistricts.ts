import { Markup } from "telegraf";

export const xorazmDistrictsKeyboard = () => Markup.inlineKeyboard([
  [
    Markup.button.callback("Urganch tumani", "xorazm_urganch"),
    Markup.button.callback("Xonqa tumani", "xorazm_xonqa")
  ],
  [
    Markup.button.callback("Xiva tumani", "xorazm_xiva"),
    Markup.button.callback("Shovot tumani", "xorazm_shovot")
  ],
  [
    Markup.button.callback("Hazorasp tumani", "xorazm_hazorasp"),
    Markup.button.callback("Qo'shko'pir tumani", "xorazm_qoshkopir")
  ],
  [
    Markup.button.callback("Bog'ot tumani", "xorazm_bogot"),
    Markup.button.callback("Gurlan tumani", "xorazm_gurlan")
  ],
  [
    Markup.button.callback("Yangiariq tumani", "xorazm_yangiariq"),
    Markup.button.callback("Yangibozor tumani", "xorazm_yangibozor")
  ],
  [
    Markup.button.callback("Tuproqqal'a tumani", "xorazm_tuproqqala")
  ],
  [
    Markup.button.callback("🔙 Orqaga", "back_to_regions")
  ]
]);