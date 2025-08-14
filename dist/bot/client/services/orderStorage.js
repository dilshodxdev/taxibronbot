"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStorageService = void 0;
// Buyurtmalarni saqlash uchun xizmat
// Avvalgi versiyada buyurtmalar faqat admin ID ga yuborilardi, lekin saqlanmasdi
// Yangi versiyada barcha buyurtmalar saqlanadi va admin ularni ko'ra oladi
class OrderStorageService {
    constructor() {
        this.orders = new Map();
        this.userCount = new Set();
        this.botLaunchDate = new Date();
    }
    // Singleton pattern - faqat bitta instance yaratish
    static getInstance() {
        if (!OrderStorageService.instance) {
            OrderStorageService.instance = new OrderStorageService();
        }
        return OrderStorageService.instance;
    }
    // Yangi buyurtma qo'shish
    addOrder(order) {
        const id = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const storedOrder = {
            ...order,
            id,
            timestamp: new Date(),
            status: 'pending'
        };
        this.orders.set(id, storedOrder);
        this.userCount.add(order.userId);
        return storedOrder;
    }
    // Buyurtmani ID bo'yicha topish
    getOrderById(id) {
        return this.orders.get(id);
    }
    // Barcha buyurtmalarni olish (pagination bilan)
    getOrders(page = 1, perPage = 5) {
        const allOrders = Array.from(this.orders.values())
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Eng yangi buyurtmalar avval
        const total = allOrders.length;
        const totalPages = Math.ceil(total / perPage);
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const orders = allOrders.slice(startIndex, endIndex);
        return {
            orders,
            total,
            totalPages,
            currentPage: page
        };
    }
    // Buyurtma holatini yangilash
    updateOrderStatus(orderId, status) {
        const order = this.orders.get(orderId);
        if (order) {
            order.status = status;
            this.orders.set(orderId, order);
            return true;
        }
        return false;
    }
    // Statistika ma'lumotlarini olish
    getStatistics() {
        const allOrders = Array.from(this.orders.values());
        const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
        const completedOrders = allOrders.filter(order => order.status === 'completed').length;
        return {
            totalUsers: this.userCount.size,
            totalOrders: allOrders.length,
            pendingOrders,
            completedOrders,
            botLaunchDate: this.botLaunchDate
        };
    }
    // Buyurtmani o'chirish
    deleteOrder(orderId) {
        return this.orders.delete(orderId);
    }
    // Barcha buyurtmalarni tozalash (faqat test uchun)
    clearAllOrders() {
        this.orders.clear();
        this.userCount.clear();
    }
}
exports.OrderStorageService = OrderStorageService;
