// import { Scenes } from "telegraf";

// // Buyurtma ma'lumotlari interfeysi - OrderStorageService uchun
// export interface StoredOrder {
//   id: string;
//   userId: number;
//   fromRegion: string;
//   fromDistrict?: string;
//   toRegion: string;
//   toDistrict?: string;
//   customerName: string;
//   customerPhone: string;
//   seatCount?: number;
//   hasBaggage?: boolean;
//   departureDate?: string;
//   comment?: string;
//   timestamp: Date;
//   status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
// }

// // Asosiy session interfeysi - bot funksionalligi uchun
// // Avvalgi versiyada BotSession xotirada saqlanardi
// // Yangi versiyada session ma'lumotlari ma'lumotlar bazasida saqlanadi
// export interface BotSession {
//   // Hozircha faqat asosiy ma'lumotlar
//   // Batafsil session ma'lumotlari DatabaseService orqali boshqariladi
//   step?: string;
//   direction?: string;
//   awaitingInput?: string;
//   fromRegion?: string;
//   fromDistrict?: string;
//   toRegion?: string;
//   toDistrict?: string;
// }

// // Scene session interfeysi - wizard scene lar uchun
// export interface MySceneSession extends Scenes.WizardSessionData {
//   channelId?: string;
//   route?: string;
//   time?: string;
//   phone?: string;
//   car?: string;
//   color?: string;
//   extra?: string;
//   // Taxi buyurtma uchun qo'shimcha maydonlar
//   direction?: string;
//   fromRegion?: string;
//   fromDistrict?: string;
//   toRegion?: string;
//   toDistrict?: string;
//   fullName?: string;
//   // E'lon berish uchun qo'shimcha maydonlar
//   announcementText?: string;
// }

// // Admin session - admin panel uchun
// export interface AdminSession {
//   currentPage: number;
//   ordersPerPage: number;
//   totalOrders: number;
//   lastViewedOrderId?: string;
// }

// // Birlashtirilgan context - oddiy session va scene funksionalligini qo'llab-quvvatlaydi
// export type MyContext = Scenes.WizardContext<MySceneSession> & {
//   session: BotSession;
//   adminSession?: AdminSession;
// };


import { Scenes } from "telegraf";

/**
 * Buyurtma ma'lumotlari interfeysi - OrderStorageService uchun
 */
export interface StoredOrder {
  id: string; // Buyurtma ID
  userId: number; // Telegram foydalanuvchi ID
  fromRegion: string; // Qayerdan (viloyat)
  fromDistrict?: string; // Qayerdan (tuman)
  toRegion: string; // Qayerga (viloyat)
  toDistrict?: string; // Qayerga (tuman)
  customerName: string; // Mijozning ismi
  customerPhone: string; // Mijozning telefoni
  seatCount?: number; // O‘rinlar soni (ixtiyoriy)
  hasBaggage?: boolean; // Bagaj bor/yo‘qligi
  departureDate?: string; // Ketish sanasi
  date?: string; // Sana (qo'shilgan maydon)
  comment?: string; // Izoh
  timestamp: Date; // Yaratilgan vaqt
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; // Buyurtma holati
}

/**
 * Asosiy session interfeysi - bot funksionalligi uchun
 * Avvalgi versiyada BotSession xotirada saqlanardi
 * Yangi versiyada session ma'lumotlari ma'lumotlar bazasida saqlanadi
 */
export interface BotSession {
  step?: string; // Joriy qadam
  direction?: string; // Yo‘nalish
  awaitingInput?: string; // Kutayotgan maydon nomi
  fromRegion?: string; // Qayerdan (viloyat)
  fromDistrict?: string; // Qayerdan (tuman)
  toRegion?: string; // Qayerga (viloyat)
  toDistrict?: string; // Qayerga (tuman)
  date?: string; // Sana (qo'shilgan maydon)
}

/**
 * Scene session interfeysi - wizard scene lar uchun
 */
export interface MySceneSession extends Scenes.WizardSessionData {
  channelId?: string; // Kanal ID
  route?: string; // Yo‘nalish
  time?: string; // Vaqt
  phone?: string; // Telefon raqami
  car?: string; // Mashina modeli
  color?: string; // Rangi
  extra?: string; // Qo‘shimcha ma'lumot
  direction?: string; // Yo‘nalish (taxi buyurtma)
  fromRegion?: string; // Qayerdan (viloyat)
  fromDistrict?: string; // Qayerdan (tuman)
  toRegion?: string; // Qayerga (viloyat)
  toDistrict?: string; // Qayerga (tuman)
  fullName?: string; // Foydalanuvchi to‘liq ismi
  date?: string; // Sana (qo'shilgan maydon)
  announcementText?: string; // E'lon matni
}

/**
 * Admin session - admin panel uchun
 */
export interface AdminSession {
  currentPage: number; // Joriy sahifa
  ordersPerPage: number; // Har sahifada nechta buyurtma
  totalOrders: number; // Umumiy buyurtmalar soni
  lastViewedOrderId?: string; // Oxirgi ko‘rilgan buyurtma ID
}

/**
 * Birlashtirilgan context - oddiy session va scene funksionalligini qo‘llab-quvvatlaydi
 */
export type MyContext = Scenes.WizardContext<MySceneSession> & {
  session: BotSession;
  adminSession?: AdminSession;
};
