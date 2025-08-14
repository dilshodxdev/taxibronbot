"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const client_1 = require("@prisma/client");
// Ma'lumotlar bazasi xizmati - Prisma ORM orqali barcha database operatsiyalarni boshqaradi
// Avvalgi versiyada OrderStorageService xotirada ma'lumotlarni saqlardi
// Yangi versiyada barcha ma'lumotlar SQLite ma'lumotlar bazasida saqlanadi
class DatabaseService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    // Singleton pattern - faqat bitta instance yaratish
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    // Ma'lumotlar bazasiga ulanishni yopish
    async disconnect() {
        await this.prisma.$disconnect();
    }
    // ==================== USER OPERATIONS ====================
    // Foydalanuvchini yaratish yoki mavjud bo'lsa yangilash
    async upsertUser(telegramId, userData) {
        return await this.prisma.user.upsert({
            where: { telegramId },
            update: {
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                fullName: userData.fullName,
                phone: userData.phone,
                languageCode: userData.languageCode,
                updatedAt: new Date()
            },
            create: {
                telegramId,
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                fullName: userData.fullName,
                phone: userData.phone,
                languageCode: userData.languageCode,
                role: 'USER'
            }
        });
    }
    // Foydalanuvchini telegram ID bo'yicha topish
    async getUserByTelegramId(telegramId) {
        return await this.prisma.user.findUnique({
            where: { telegramId }
        });
    }
    // Barcha foydalanuvchilar sonini olish
    async getTotalUsers() {
        return await this.prisma.user.count();
    }
    // Barcha foydalanuvchilarni olish - e'lon yuborish uchun
    async getAllUsers() {
        return await this.prisma.user.findMany({
            where: {
                role: 'USER' // Faqat oddiy foydalanuvchilar
            },
            select: {
                id: true,
                telegramId: true,
                fullName: true,
                username: true
            }
        });
    }
    // ==================== ORDER OPERATIONS ====================
    // Yangi buyurtma yaratish
    async createOrder(orderData) {
        // Buyurtma raqamini yaratish (ORD-000001 formatida)
        const orderNumber = await this.generateOrderNumber();
        return await this.prisma.order.create({
            data: {
                orderNumber,
                userId: orderData.userId,
                fromRegion: orderData.fromRegion,
                fromDistrict: orderData.fromDistrict,
                toRegion: orderData.toRegion,
                toDistrict: orderData.toDistrict,
                customerName: orderData.customerName,
                customerPhone: orderData.customerPhone,
                notes: orderData.notes,
                price: orderData.price,
                status: 'PENDING'
            },
            include: {
                user: true
            }
        });
    }
    // Buyurtma raqamini yaratish (ORD-000001 formatida)
    // Avvalgi versiyada buyurtma ID si cuid() orqali yaratilardi
    // Yangi versiyada buyurtma raqami ketma-ket va 6 xonali formatda bo'ladi
    async generateOrderNumber() {
        const lastOrder = await this.prisma.order.findFirst({
            orderBy: { orderNumber: 'desc' }
        });
        let nextNumber = 1;
        if (lastOrder) {
            // ORD-000001 formatidan raqamni ajratib olish
            const lastNumber = parseInt(lastOrder.orderNumber.replace('ORD-', ''));
            nextNumber = lastNumber + 1;
        }
        // 6 xonali formatda qaytarish
        return `ORD-${nextNumber.toString().padStart(6, '0')}`;
    }
    // Buyurtmani ID bo'yicha topish
    async getOrderById(orderId) {
        return await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true
            }
        });
    }
    // Buyurtmani raqam bo'yicha topish
    async getOrderByNumber(orderNumber) {
        return await this.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                user: true
            }
        });
    }
    // Barcha buyurtmalarni olish (pagination bilan)
    async getOrders(page = 1, limit = 5) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: true
                }
            }),
            this.prisma.order.count()
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            orders,
            total,
            totalPages,
            currentPage: page
        };
    }
    // Buyurtma holatini yangilash
    async updateOrderStatus(orderId, status) {
        try {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status }
            });
            return true;
        }
        catch (error) {
            console.error('Buyurtma holatini yangilashda xatolik:', error);
            return false;
        }
    }
    // Buyurtmani o'chirish
    async deleteOrder(orderId) {
        try {
            await this.prisma.order.delete({
                where: { id: orderId }
            });
            return true;
        }
        catch (error) {
            console.error('Buyurtmani o\'chirishda xatolik:', error);
            return false;
        }
    }
    // Barcha buyurtmalar sonini olish
    async getTotalOrders() {
        return await this.prisma.order.count();
    }
    // Holat bo'yicha buyurtmalar sonini olish
    async getOrdersByStatus(status) {
        return await this.prisma.order.count({
            where: { status }
        });
    }
    // Foydalanuvchining buyurtmalarini olish - foydalanuvchi o'z buyurtmalarini ko'rish uchun
    async getOrdersByUserId(telegramId) {
        const user = await this.getUserByTelegramId(telegramId);
        if (!user) {
            return [];
        }
        return await this.prisma.order.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                user: true
            }
        });
    }
    // ==================== SESSION OPERATIONS ====================
    // Foydalanuvchi sessiyasini yaratish yoki yangilash
    async upsertUserSession(userId, sessionData) {
        // Avvalgi versiyada userId unique emas edi, shuning uchun upsert ishlamaydi
        // Yangi versiyada avval mavjud session ni topamiz, keyin yangilaymiz yoki yaratamiz
        const existingSession = await this.prisma.userSession.findFirst({
            where: { userId }
        });
        if (existingSession) {
            return await this.prisma.userSession.update({
                where: { id: existingSession.id },
                data: {
                    step: sessionData.step,
                    direction: sessionData.direction,
                    awaitingInput: sessionData.awaitingInput,
                    sessionData: sessionData.sessionData || '{}',
                    updatedAt: new Date()
                }
            });
        }
        else {
            return await this.prisma.userSession.create({
                data: {
                    userId,
                    step: sessionData.step,
                    direction: sessionData.direction,
                    awaitingInput: sessionData.awaitingInput,
                    sessionData: sessionData.sessionData || '{}'
                }
            });
        }
    }
    // Foydalanuvchi sessiyasini olish
    async getUserSession(userId) {
        // Avvalgi versiyada findUnique ishlatilardi, lekin userId unique emas
        // Yangi versiyada findFirst ishlatiladi, chunki userId unique emas
        return await this.prisma.userSession.findFirst({
            where: { userId }
        });
    }
    // Sessiyani o'chirish
    async deleteUserSession(userId) {
        try {
            // Avvalgi versiyada delete ishlatilardi, lekin userId unique emas
            // Yangi versiyada avval session ni topamiz, keyin o'chiramiz
            const existingSession = await this.prisma.userSession.findFirst({
                where: { userId }
            });
            if (existingSession) {
                await this.prisma.userSession.delete({
                    where: { id: existingSession.id }
                });
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Sessiyani o\'chirishda xatolik:', error);
            return false;
        }
    }
    // ==================== STATISTICS OPERATIONS ====================
    // Bot statistikasini yaratish yoki yangilash
    async upsertBotStatistics(statsData) {
        const existingStats = await this.prisma.botStatistics.findFirst();
        if (existingStats) {
            return await this.prisma.botStatistics.update({
                where: { id: existingStats.id },
                data: {
                    totalUsers: statsData.totalUsers,
                    totalOrders: statsData.totalOrders,
                    pendingOrders: statsData.pendingOrders,
                    confirmedOrders: statsData.confirmedOrders,
                    completedOrders: statsData.completedOrders,
                    cancelledOrders: statsData.cancelledOrders,
                    dailyStats: statsData.dailyStats,
                    lastActivity: new Date(),
                    updatedAt: new Date()
                }
            });
        }
        else {
            return await this.prisma.botStatistics.create({
                data: {
                    totalUsers: statsData.totalUsers,
                    totalOrders: statsData.totalOrders,
                    pendingOrders: statsData.pendingOrders,
                    confirmedOrders: statsData.confirmedOrders,
                    completedOrders: statsData.completedOrders,
                    cancelledOrders: statsData.cancelledOrders,
                    dailyStats: statsData.dailyStats,
                    botLaunchDate: new Date(),
                    lastActivity: new Date()
                }
            });
        }
    }
    // Bot statistikasini olish
    async getBotStatistics() {
        return await this.prisma.botStatistics.findFirst();
    }
    // Statistikani yangilash
    async updateStatistics() {
        const [totalUsers, totalOrders, pendingOrders, confirmedOrders, completedOrders, cancelledOrders] = await Promise.all([
            this.getTotalUsers(),
            this.getTotalOrders(),
            this.getOrdersByStatus('PENDING'),
            this.getOrdersByStatus('CONFIRMED'),
            this.getOrdersByStatus('COMPLETED'),
            this.getOrdersByStatus('CANCELLED')
        ]);
        await this.upsertBotStatistics({
            totalUsers,
            totalOrders,
            pendingOrders,
            confirmedOrders,
            completedOrders,
            cancelledOrders
        });
    }
}
exports.DatabaseService = DatabaseService;
