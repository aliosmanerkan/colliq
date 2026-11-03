# Poke Agent (Monorepo)

Next.js (App Router, Tailwind CSS v4) frontend ve Express (ESM, Sequelize, Socket.IO) backend içeren modern **pnpm monorepo** mimarisi.

## 📁 Proje Yapısı

```text
poke-agent/
├── backend/                  # Express (ES Modules) Backend API
│   ├── controllers/          # Express rotaları (AuthControllers vb.)
│   ├── middleware/           # JWT kimlik kontrolü (authenticationCheck.js)
│   ├── model/                # Sequelize ORM modelleri (user.js, model.js)
│   ├── services/             # İş mantığı katmanı (AuthServices.js)
│   ├── utils/                # HMAC-SHA512 hash vb. yardımcılar (hash.js)
│   ├── db.config.js          # PostgreSQL bağlantı konfigürasyonu
│   ├── server.js             # Express + Socket.IO HTTP Server
│   ├── .env.example          # Ortam değişkenleri şablonu
│   └── package.json
├── frontend/                 # Next.js (App Router) Frontend
│   ├── app/                  # Sayfa ve düzenler (layout.js, page.js, globals.css)
│   ├── lib/                  # Axios (api.js) ve Socket.IO Client (socket.js)
│   ├── jsconfig.json         # @/* import path alias ayarı
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   ├── .env.local
│   └── package.json
├── package.json              # Monorepo kök scriptleri (concurrently)
├── pnpm-workspace.yaml       # pnpm workspace tanımı
└── .gitignore
```

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükle
Kök dizinden tek komutla tüm monorepo paketlerini yükleyin:
```bash
pnpm install
```

### 2. Geliştirme Sunucusunu Başlat
Tek komutla hem backend (port 5001) hem frontend (port 3000) eşzamanlı çalışır:
```bash
pnpm dev
```

#### Ayrı ayrı çalıştırmak isterseniz:
```bash
# Sadece backend (nodemon)
pnpm dev:backend

# Sadece frontend (next dev)
pnpm dev:frontend
```

## ⚙️ Ortam Değişkenleri (.env)
* **Backend:** `backend/.env` dosyası hazırlandı (`PORT=5001`, `DB_NAME=poke_agent`).
* **Frontend:** `frontend/.env.local` dosyası hazırlandı (`NEXT_PUBLIC_API_URL=http://localhost:5001`).
