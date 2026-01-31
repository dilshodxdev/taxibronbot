import * as fs from 'fs';
import * as path from 'path';

// Log darajalari
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Log yozuvi interfeysi
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  error?: Error;
  data?: any;
}

/**
 * Markazlashtirilgan Logger Service
 * Barcha xatolar va ma'lumotlarni console va faylga yozadi
 */
export class Logger {
  private static instance: Logger;
  private logDir: string;
  private logFile: string;
  private isInitialized: boolean = false;

  private constructor() {
    // Logs papkasini yaratish
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, `bot-${this.getDateString()}.log`);
    this.initialize();
  }

  // Singleton pattern
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Logger ni ishga tushirish
  private initialize(): void {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
      this.isInitialized = true;
      this.info('Logger initialized', 'Logger');
    } catch (error) {
      console.error('❌ Logger initialization failed:', error);
    }
  }

  // Sana stringini olish (fayl nomi uchun)
  private getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  // Vaqt stringini olish (log yozuvi uchun)
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  // Faylga yozish
  private writeToFile(entry: LogEntry): void {
    if (!this.isInitialized) return;

    try {
      const logLine = this.formatLogEntry(entry);
      fs.appendFileSync(this.logFile, logLine + '\n', 'utf8');
    } catch (error) {
      console.error('❌ Log write failed:', error);
    }
  }

  // Log yozuvini formatlash
  private formatLogEntry(entry: LogEntry): string {
    let logLine = `[${entry.timestamp}] [${entry.level}]`;
    
    if (entry.context) {
      logLine += ` [${entry.context}]`;
    }
    
    logLine += ` ${entry.message}`;
    
    if (entry.error) {
      logLine += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        logLine += `\n  Stack: ${entry.error.stack}`;
      }
    }
    
    if (entry.data) {
      logLine += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    return logLine;
  }

  // Console ga chiqarish
  private logToConsole(entry: LogEntry): void {
    const prefix = this.getConsolePrefix(entry.level);
    let message = `${prefix} ${entry.message}`;
    
    if (entry.context) {
      message = `${prefix} [${entry.context}] ${entry.message}`;
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.log(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
        console.error(message);
        if (entry.error) {
          console.error(entry.error);
        }
        break;
    }
  }

  // Console prefix olish
  private getConsolePrefix(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '🔍';
      case LogLevel.INFO:
        return 'ℹ️';
      case LogLevel.WARN:
        return '⚠️';
      case LogLevel.ERROR:
        return '❌';
      default:
        return '📝';
    }
  }

  // Asosiy log funksiyasi
  private log(level: LogLevel, message: string, context?: string, error?: Error, data?: any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      context,
      error,
      data
    };

    this.logToConsole(entry);
    this.writeToFile(entry);
  }

  // Public metodlar
  public debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, undefined, data);
  }

  public info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, undefined, data);
  }

  public warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, undefined, data);
  }

  public error(message: string, context?: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, context, error, data);
  }

  // Telegram bot xatolarini qayd qilish
  public botError(message: string, error?: Error, userId?: number | string): void {
    this.error(message, 'TelegramBot', error, userId ? { userId } : undefined);
  }

  // Database xatolarini qayd qilish
  public dbError(message: string, error?: Error, query?: string): void {
    this.error(message, 'Database', error, query ? { query } : undefined);
  }
}

// Singleton instance eksport qilish
export const logger = Logger.getInstance();
