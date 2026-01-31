# VPS Deployment Guide

## 1. Fayllarni VPS ga yuklash

```bash
# Git orqali
git clone your-repo-url
cd taxibronbot

# Yoki SCP orqali
scp -r . user@your-vps:/var/www/taxibronbot
```

## 2. O'rnatish

```bash
# Node.js 18+ o'rnatilgan bo'lishi kerak
node -v

# Dependencies
npm install

# .env faylini sozlash
cp .env.example .env
nano .env  # BOT_TOKEN, ADMIN_ID, etc.

# Database
npm run prisma:migrate
```

## 3. Build va Start

```bash
# Build
npm run build

# Test
npm start  # Ctrl+C bilan to'xtatish
```

## 4. PM2 bilan ishga tushirish

```bash
# PM2 o'rnatish
npm install -g pm2

# Bot ishga tushirish
pm2 start ecosystem.config.js

# Auto-start on reboot
pm2 startup
pm2 save
```

## 5. Foydalanish

```bash
pm2 logs taxibronbot   # Loglarni ko'rish
pm2 restart taxibronbot # Restart
pm2 stop taxibronbot    # To'xtatish
pm2 status              # Holat
```

## Muhim Fayllar

| Fayl | Maqsad |
|------|--------|
| `.env` | Bot token va admin IDs |
| `prisma/db/database.db` | SQLite database |
| `logs/` | Error logs |
| `ecosystem.config.js` | PM2 config |
