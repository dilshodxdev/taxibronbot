# TaxiBronBot

Telegram taxi booking bot for Uzbekistan.

## Requirements

- Node.js >= 18.0.0
- SQLite

## Installation

```bash
# Dependencies o'rnatish
npm install

# Prisma client generatsiya
npm run prisma:generate

# Database migratsiya
npm run prisma:migrate
```

## Environment Variables

`.env` faylini yarating:

```env
BOT_TOKEN=your_bot_token
ADMIN_ID=your_admin_telegram_id
SUPER_ADMIN_ID=your_super_admin_telegram_id
CHANNEL_ID=your_channel_id
DATABASE_URL=file:./prisma/db/database.db
```

## Development

```bash
npm run dev
```

## Production (VPS)

```bash
# Build
npm run build

# Start
npm start
```

### PM2 bilan ishga tushirish (Recommended)

```bash
# PM2 o'rnatish
npm install -g pm2

# Bot ishga tushirish
pm2 start dist/main.js --name taxibronbot

# Auto-restart on boot
pm2 startup
pm2 save

# Logs ko'rish
pm2 logs taxibronbot

# Restart
pm2 restart taxibronbot
```

## Directory Structure

```
├── src/
│   ├── main.ts              # Entry point
│   ├── config.ts            # Configuration
│   ├── bot/
│   │   └── client/          # Bot handlers
│   ├── services/
│   │   ├── database.ts      # Prisma database service
│   │   └── logger.ts        # Error logging
│   ├── middlewares/
│   │   └── sceneMiddleware.ts
│   └── utils/
│       └── utils.ts
├── prisma/
│   └── schema.prisma        # Database schema
├── logs/                    # Log files
└── dist/                    # Compiled JS (production)
```
