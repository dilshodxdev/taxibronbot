import { Scenes } from "telegraf";

// Buyurtma ma'lumotlari interfeysi - OrderStorageService uchun
export interface StoredOrder {
  id: string;
  userId: number;
  fromRegion: string;
  fromDistrict?: string;
  toRegion: string;
  toDistrict?: string;
  customerName: string;
  customerPhone: string;
  seatCount?: number;
  hasBaggage?: boolean;
  departureDate?: string;
  comment?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// Asosiy session interfeysi - bot funksionalligi uchun
// Avvalgi versiyada BotSession xotirada saqlanardi
// Yangi versiyada session ma'lumotlari ma'lumotlar bazasida saqlanadi
export interface BotSession {
  // Hozircha faqat asosiy ma'lumotlar
  // Batafsil session ma'lumotlari DatabaseService orqali boshqariladi
  step?: string;
  direction?: string;
  awaitingInput?: string;
  fromRegion?: string;
  fromDistrict?: string;
  toRegion?: string;
  toDistrict?: string;
}

// Scene session interfeysi - wizard scene lar uchun
export interface MySceneSession extends Scenes.WizardSessionData {
  channelId?: string;
  route?: string;
  time?: string;
  phone?: string;
  car?: string;
  color?: string;
  extra?: string;
  // Taxi buyurtma uchun qo'shimcha maydonlar
  direction?: string;
  fromRegion?: string;
  fromDistrict?: string;
  toRegion?: string;
  toDistrict?: string;
  fullName?: string;
  // E'lon berish uchun qo'shimcha maydonlar
  announcementText?: string;
}

// Admin session - admin panel uchun
export interface AdminSession {
  currentPage: number;
  ordersPerPage: number;
  totalOrders: number;
  lastViewedOrderId?: string;
}

// Birlashtirilgan context - oddiy session va scene funksionalligini qo'llab-quvvatlaydi
export type MyContext = Scenes.WizardContext<MySceneSession> & {
  session: BotSession;
  adminSession?: AdminSession;
};
