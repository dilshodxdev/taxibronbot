/**
 * Utility functions - markazlashtirilgan yordamchi funksiyalar
 */

// Buyurtma holati emojilari
export function getStatusEmoji(status: string): string {
    switch (status) {
        case 'PENDING':
            return '⏳';
        case 'CONFIRMED':
            return '✅';
        case 'COMPLETED':
            return '🎯';
        case 'CANCELLED':
            return '❌';
        default:
            return '❓';
    }
}

// Buyurtma holati matnlari
export function getStatusText(status: string): string {
    switch (status) {
        case 'PENDING':
            return 'Kutilmoqda';
        case 'CONFIRMED':
            return 'Tasdiqlangan';
        case 'COMPLETED':
            return 'Bajarilgan';
        case 'CANCELLED':
            return 'Bekor qilingan';
        default:
            return "Noma'lum";
    }
}

/**
 * Telefon raqamini tekshirish va formatlash
 * @param phone - Kiritilgan telefon raqami
 * @returns Formatlangan telefon raqami yoki null agar noto'g'ri bo'lsa
 */
export function formatPhone(phone: string): string | null {
    // Barcha bo'shliqlar va tire larni olib tashlash
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Agar + bilan boshlanmasa va 9 ta raqam bo'lsa, +998 qo'shish
    if (!cleaned.startsWith('+') && /^\d{9}$/.test(cleaned)) {
        cleaned = '+998' + cleaned;
    }

    // Agar 998 bilan boshlanib, + bo'lmasa
    if (cleaned.startsWith('998') && !cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }

    // Validatsiya: +998 bilan boshlanib, 12 ta raqam bo'lishi kerak
    if (/^\+998\d{9}$/.test(cleaned)) {
        return cleaned;
    }

    return null;
}

/**
 * Telefon raqamini tekshirish
 * @param phone - Tekshiriladigan telefon raqami
 * @returns true agar to'g'ri format bo'lsa
 */
export function isValidPhone(phone: string): boolean {
    return formatPhone(phone) !== null;
}

/**
 * Vaqtni formatlash (O'zbekiston vaqt zonasi)
 * @param date - Formatlash kerak bo'lgan sana
 * @returns Formatlangan vaqt stringi
 */
export function formatDateTime(date: Date): string {
    return date.toLocaleString('uz-UZ', {
        timeZone: 'Asia/Tashkent',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Faqat sanani formatlash
 * @param date - Formatlash kerak bo'lgan sana
 * @returns Formatlangan sana stringi
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('uz-UZ', {
        timeZone: 'Asia/Tashkent',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Bugungi sanani DD.MM.YYYY formatida olish
 */
export function getTodayDate(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
}

/**
 * Vaqt formatini tekshirish (HH:MM)
 */
export function isValidTime(time: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

/**
 * Sana formatini tekshirish (DD.MM.YYYY)
 */
export function isValidDate(date: string): boolean {
    return /^\d{2}\.\d{2}\.\d{4}$/.test(date);
}
