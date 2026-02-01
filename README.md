# SCAM - نظام إدارة المحتوى الأكاديمي الذكي

<div dir="rtl">

نظام متكامل لإدارة المحتوى الأكاديمي مع دعم الذكاء الاصطناعي.

</div>

## 🚀 البدء السريع

### المتطلبات

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+ (محلي أو Supabase)

### التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/MoTechSys/SCAM.git
cd SCAM

# تثبيت التبعيات
pnpm install

# نسخ ملف البيئة
cp .env.example .env
# عدّل .env حسب إعداداتك

# تهيئة قاعدة البيانات
pnpm db:push

# تشغيل المشروع
pnpm dev
```

### الوصول

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api

## 📁 هيكل المشروع

```
SCAM/
├── apps/
│   ├── frontend/         # واجهة المستخدم (React + Vite)
│   └── backend/          # الخادم (Hono + Drizzle)
├── packages/
│   └── shared/           # كود مشترك (Types, Utils)
├── docs/                 # التوثيق
├── .env.example          # قالب متغيرات البيئة
└── package.json          # إعدادات Monorepo
```

## 🛠️ الأوامر المتاحة

| الأمر | الوصف |
|-------|-------|
| `pnpm dev` | تشغيل Frontend + Backend معاً |
| `pnpm dev:frontend` | تشغيل Frontend فقط |
| `pnpm dev:backend` | تشغيل Backend فقط |
| `pnpm build` | بناء المشروع للإنتاج |
| `pnpm db:push` | تطبيق تغييرات قاعدة البيانات |
| `pnpm test` | تشغيل الاختبارات |

## 🔧 الإعدادات

### قاعدة البيانات

يدعم المشروع:
- PostgreSQL محلي
- Supabase
- Railway
- أي PostgreSQL متوافق

### التخزين

يدعم المشروع:
- تخزين محلي
- Supabase Storage
- AWS S3

راجع `.env.example` لجميع الخيارات.

## 📱 إضافة تطبيق موبايل

```bash
# إنشاء تطبيق React Native
cd apps
npx create-expo-app mobile

# أو Flutter
flutter create mobile
```

## 🚀 النشر

### Frontend (Vercel)

```bash
cd apps/frontend
vercel
```

### Backend (Railway)

```bash
cd apps/backend
railway up
```

## 📄 الرخصة

MIT License

---

<div dir="rtl">

صُنع بـ ❤️ بواسطة MoTechSys

</div>
