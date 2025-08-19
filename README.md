# 🤖 LangChain Agent API

Bu loyiha LangChain va OpenAI'dan foydalanib yaratilgan AI Agent API hisoblanadi. Agent turli tool'lar bilan ishlash imkoniyatiga ega va foydalanuvchilar bilan chat tarixini saqlaydi.

## ✨ Xususiyatlar

- 🧠 **OpenAI GPT modellari** bilan ishlash
- 🔧 **Tool'lar tizimi** - turli vazifalarni bajarish uchun
- 💾 **Redis** orqali chat tarixini saqlash
- 🌐 **RESTful API** - oson integratsiya uchun
- 🏗️ **Clean Architecture** - tushunarli va kengaytiriladigan kod
- 📊 **Token usage tracking** - xarajatlarni kuzatish

## 🛠️ Mavjud Tool'lar

1. **⏰ Vaqt Tool'i** - Joriy vaqtni olish
2. **🔍 ChromaDB Qidiruv** - PDF hujjatlarida semantic qidiruv
3. **🌐 DuckDuckGo Qidiruv** - Internet qidiruvi
4. **📚 Wikipedia Qidiruv** - Wikipedia'da qidiruv
5. **📡 Web Ma'lumot Olish** - URL'lardan ma'lumot olish
6. **🧮 Kalkulyator** - Matematik amallar

## 🚀 O'rnatish va Ishga Tushirish

### Talablar

- Node.js 18+
- Redis server
- OpenAI API key

### 1. Loyihani klonlash

```bash
git clone <repository-url>
cd langchain-agent-api
```

### 2. Bog'liqliklarni o'rnatish

```bash
npm install
```

### 3. Environment variables sozlash

`.env` faylini yarating va quyidagi ma'lumotlarni kiriting:

```env
# Asosiy sozlamalar
PORT=3000
NODE_ENV=development

# API kalitlari
OPENAI_API_KEY="your-openai-api-key"

# Redis
REDIS_URL=redis://localhost:6379

# Agent sozlamalari
CHAT_HISTORY_TTL=604800
MODEL=gpt-4o-mini-2024-07-18
TEMPERATURE=0.7
```

### 4. Redis'ni ishga tushirish

```bash
# Docker orqali
docker run -d -p 6379:6379 redis:alpine

# Yoki local Redis
redis-server
```

### 5. Run the project

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Or start with production environment
npm run start:prod
```

### 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t langchain-agent-api .

# Run with Docker
docker run -p 3000:3000 --env-file .env langchain-agent-api

# Or use Docker Compose
docker-compose up -d
```

## 📋 API Endpoint'lari

### Chat Endpoint'lari

#### Oddiy Chat
```http
POST /ai/chat-with-memory/chat
Content-Type: application/json

{
  "userId": "user123",
  "input": "Salom, qanday yordam bera olaman?"
}
```

#### Agent bilan Chat (Tool'lar bilan)
```http
POST /ai/chat-with-memory/agent
Content-Type: application/json

{
  "userId": "user123",
  "input": "Bugungi ob-havo haqida ma'lumot ber",
  "agentType": "openai_tools",
  "enabledTools": ["duckduckgo_search", "get_current_time"]
}
```

### Tool'larni Boshqarish

#### Tool'lar ro'yxati
```http
GET /ai/chat-with-memory/tools
```

#### Tool'ni yoqish/o'chirish
```http
PUT /ai/chat-with-memory/tools/duckduckgo_search
Content-Type: application/json

{
  "enabled": true
}
```

### Tarixni Boshqarish

#### Foydalanuvchi tarixini tozalash
```http
DELETE /ai/chat-with-memory/history/user123
```

## 🏗️ Loyiha Strukturasi

```
src/
├── agents/                     # Agent va tool'lar
│   ├── tools/                  # Tool'lar tizimi
│   │   ├── base/              # Asosiy interfeys'lar
│   │   ├── implementations/   # Tool implementatsiyalari
│   │   └── tool-registry.ts   # Tool'larni boshqarish
│   └── chat-with-memory/      # Chat agent
│       ├── controllers/       # HTTP controller'lar
│       ├── services/          # Business logic
│       ├── routes/           # API route'lar
│       ├── dto/              # Data transfer objects
│       └── storage/          # Ma'lumot saqlash
├── common/                    # Umumiy utility'lar
├── config/                    # Konfiguratsiya
├── v1/                       # API versiyasi
├── app.ts                    # Express ilovasi
├── server.ts                 # Server kirish nuqtasi
└── index.ts                  # Asosiy fayl
```

## 🔧 Tool Yaratish

Yangi tool yaratish uchun:

1. `src/agents/tools/implementations/` papkasida yangi fayl yarating
2. `IToolService` interfeys'ini implement qiling
3. `ToolRegistry`'da ro'yxatga qo'shing

Misol:

```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { IToolService } from "../base/tool.interface.js";

export class MyCustomToolService implements IToolService {
  readonly name = "my_custom_tool";
  readonly description = "Mening maxsus tool'im";

  createTool() {
    return tool(
      async (input: { param: string }): Promise<string> => {
        // Tool logikasi
        return `Natija: ${input.param}`;
      },
      {
        name: this.name,
        description: this.description,
        schema: z.object({
          param: z.string()
        }),
      }
    );
  }
}
```

## 🐛 Debug va Monitoring

### Log'lar

Loyiha console log'lar orqali debug ma'lumotlarini beradi:

- 🚀 Server holati
- 🤖 Agent so'rovlari
- 🔧 Tool'lar faoliyati
- 📊 Token statistikasi
- ❌ Xatolar

### Environment Variables

Debug uchun qo'shimcha sozlamalar:

```env
AGENT_VERBOSE=true          # Agent debug log'lari
NODE_ENV=development        # Development rejimi
```

## 🤝 Hissa Qo'shish

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/yangi-xususiyat`)
3. O'zgarishlarni commit qiling (`git commit -am 'Yangi xususiyat qo'shildi'`)
4. Branch'ni push qiling (`git push origin feature/yangi-xususiyat`)
5. Pull Request yarating

## 📄 Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatiladi.

## 🆘 Yordam

Agar savollaringiz bo'lsa yoki yordam kerak bo'lsa:

1. GitHub Issues orqali muammo yarating
2. Hujjatlarni diqqat bilan o'qing
3. Log'larni tekshiring

---

**Muvaffaqiyatli kodlash! 🎉**