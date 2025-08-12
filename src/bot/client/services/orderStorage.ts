import { StoredOrder } from "../types/context";

// Buyurtmalarni saqlash uchun xizmat
// Avvalgi versiyada buyurtmalar faqat admin ID ga yuborilardi, lekin saqlanmasdi
// Yangi versiyada barcha buyurtmalar saqlanadi va admin ularni ko'ra oladi
export class OrderStorageService {
  private static instance: OrderStorageService;
  private orders: Map<string, StoredOrder> = new Map();
  private userCount: Set<number> = new Set();
  private botLaunchDate: Date = new Date();

  // Singleton pattern - faqat bitta instance yaratish
  public static getInstance(): OrderStorageService {
    if (!OrderStorageService.instance) {
      OrderStorageService.instance = new OrderStorageService();
    }
    return OrderStorageService.instance;
  }

  // Yangi buyurtma qo'shish
  public addOrder(order: Omit<StoredOrder, 'id' | 'timestamp' | 'status'>): StoredOrder {
    const id = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const storedOrder: StoredOrder = {
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
  public getOrderById(id: string): StoredOrder | undefined {
    return this.orders.get(id);
  }

  // Barcha buyurtmalarni olish (pagination bilan)
  public getOrders(page: number = 1, perPage: number = 5): {
    orders: StoredOrder[];
    total: number;
    totalPages: number;
    currentPage: number;
  } {
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
  public updateOrderStatus(orderId: string, status: StoredOrder['status']): boolean {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      this.orders.set(orderId, order);
      return true;
    }
    return false;
  }

  // Statistika ma'lumotlarini olish
  public getStatistics(): {
    totalUsers: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    botLaunchDate: Date;
  } {
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
  public deleteOrder(orderId: string): boolean {
    return this.orders.delete(orderId);
  }

  // Barcha buyurtmalarni tozalash (faqat test uchun)
  public clearAllOrders(): void {
    this.orders.clear();
    this.userCount.clear();
  }
} 