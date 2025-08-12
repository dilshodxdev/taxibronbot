# Loyihaning Muhim Muqaddimasi

Ushbu loyiha ishga tushirilishi uchun quyidagi atamalar va ularning qiymatlarini `.env` faylida to‘g‘ri sozlash talab etiladi:

- **DATABASE_URL**  
  Loyihaning ma’lumotlar bazasi manzilini ko‘rsatadi. Masalan:  

Bu yerda `file:` prefiksi bilan SQLite fayl yo‘li ko‘rsatiladi. Agar boshqa turdagi ma’lumotlar bazasidan foydalanilsa, ularga mos URL berilishi kerak.

- **BOT_TOKEN**  
Telegram botingiz uchun token. Bot yaratganingizda [Telegram BotFather](https://t.me/BotFather) dan olasiz. Ushbu qiymat maxfiy va hech qachon ommaga oshkor qilinmasligi kerak.

- **CHANNEL_ID**  
Botning xabar yuborishi yoki kuzatishi kerak bo‘lgan Telegram kanali identifikatori. Bu odatda `-100` bilan boshlanuvchi raqam ko‘rinishida bo‘ladi.

- **ADMIN_ID**  
Bot ma’muriy huquqiga ega bo‘lgan foydalanuvchi (admin) ning Telegram ID raqami. Bu raqam orqali bot ma’mur uchun maxsus buyruqlarni aniqlaydi.

- **SUPER_ADMIN_ID**  
Eng yuqori huquqli foydalanuvchi (super admin) Telegram ID-si. U botning barcha funksiyalariga to‘liq kirish huquqiga ega.

---

**Eslatma:** `.env` faylini yaratib, yuqoridagi qiymatlarni to‘g‘ri to‘ldirish loyiha ish faoliyatining muhim qismidir. Maxfiy ma’lumotlar (BOT_TOKEN va ID raqamlar) xavfsiz saqlanishi kerak.
