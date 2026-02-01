# برومبت تسليم مشروع S-ACM (نظام إدارة المحتوى الأكاديمي الذكي)

## 📋 ملخص المشروع
مشروع **S-ACM** هو نظام إدارة محتوى أكاديمي ذكي مبني بـ:
- **Backend**: Hono.js + Drizzle ORM + PostgreSQL (Supabase)
- **Frontend**: React + Vite + TailwindCSS
- **قاعدة البيانات**: Supabase (PostgreSQL)

## 🔗 الروابط المهمة
- **GitHub Repository**: https://github.com/MoTechSys/SCAM
- **Supabase Project ID**: `hmqmtxgyuarccyrioics`
- **Supabase Project Name**: `scam`
- **Region**: `ap-south-1` (Mumbai)

## ✅ ما تم إنجازه

### 1. إصلاح اتصال قاعدة البيانات
- تم تحديث `apps/backend/src/db/index.ts` لاستخدام `SCAM_DATABASE_URL` بدلاً من `DATABASE_URL` لتجنب التعارض مع بيئة Manus
- تم إصلاح إعدادات SSL للاتصال الآمن
- تم زيادة timeout الاتصال إلى 30 ثانية

### 2. إصلاح Supabase Client
- تم تحديث `apps/backend/src/lib/supabase.ts` للتعامل مع عدم وجود credentials
- يستخدم الآن `SUPABASE_ANON_KEY` كـ fallback

### 3. إنشاء جداول قاعدة البيانات (عبر MCP)
تم إنشاء جميع الجداول في Supabase:
- `roles` - الأدوار (admin, instructor, student)
- `departments` - الأقسام
- `majors` - التخصصات
- `levels` - المستويات الدراسية
- `users` - المستخدمين
- `courses` - المقررات
- `files` - الملفات
- `notifications` - الإشعارات
- `audit_logs` - سجل التدقيق
- `refresh_tokens` - رموز التجديد
- `ai_conversations` - محادثات الذكاء الاصطناعي
- `settings` - الإعدادات

### 4. إضافة البيانات الأساسية
تم إضافة الأدوار الأساسية:
- `admin` - مدير النظام (صلاحيات كاملة)
- `instructor` - أستاذ
- `student` - طالب

## ❌ ما يحتاج إكمال

### 1. إضافة مستخدم المدير (Admin User)
يجب إنشاء مستخدم المدير الأول. استخدم هذا الأمر عبر MCP:

```sql
-- أولاً احصل على role_id للمدير
SELECT id FROM roles WHERE name = 'admin';
-- النتيجة: 4e6c0c1c-5d74-4e37-9721-4b933e857067

-- ثم أضف المستخدم (كلمة المرور مشفرة بـ bcrypt لـ "Admin@123")
INSERT INTO users (email, password_hash, full_name, role_id, is_active)
VALUES (
  'admin@s-acm.com',
  '$2b$10$rQZ5QzKqK8K8K8K8K8K8K.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'مدير النظام',
  '4e6c0c1c-5d74-4e37-9721-4b933e857067',
  true
);
```

**ملاحظة**: يجب توليد password_hash صحيح باستخدام bcrypt. يمكنك استخدام:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('Admin@123', 10);
console.log(hash);
```

### 2. إنشاء ملف .env للـ Backend
يجب إنشاء ملف `apps/backend/.env` بالمحتوى التالي:

```env
# Database - Supabase Connection Pooler
SCAM_DATABASE_URL=postgresql://postgres.hmqmtxgyuarccyrioics:Ab8877Moain@aws-1-ap-south-1.pooler.supabase.com:6543/postgres

# Supabase
SUPABASE_URL=https://hmqmtxgyuarccyrioics.supabase.co
SUPABASE_ANON_KEY=[احصل عليه من لوحة تحكم Supabase -> Settings -> API]

# Server
PORT=5005
NODE_ENV=development
JWT_SECRET=scam-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Storage
STORAGE_TYPE=supabase

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3003,http://localhost:5173,*
```

### 3. إنشاء ملف .env للـ Frontend
يجب إنشاء ملف `apps/frontend/.env`:

```env
VITE_API_URL=http://localhost:5005
VITE_SUPABASE_URL=https://hmqmtxgyuarccyrioics.supabase.co
VITE_SUPABASE_ANON_KEY=[نفس المفتاح أعلاه]
```

### 4. تشغيل المشروع
```bash
# استنساخ المشروع
git clone https://github.com/MoTechSys/SCAM.git
cd SCAM

# تثبيت التبعيات
pnpm install

# تشغيل Backend
cd apps/backend
pnpm dev

# في terminal آخر - تشغيل Frontend
cd apps/frontend
pnpm dev
```

### 5. اختبار تسجيل الدخول
بعد إضافة مستخدم المدير:
- البريد: `admin@s-acm.com`
- كلمة المرور: `Admin@123`

## 🔑 معلومات Supabase المهمة

| المعلومة | القيمة |
|----------|--------|
| Project ID | `hmqmtxgyuarccyrioics` |
| Project Name | `scam` |
| Region | `ap-south-1` |
| Database Host | `aws-1-ap-south-1.pooler.supabase.com` |
| Database Port | `6543` |
| Database User | `postgres.hmqmtxgyuarccyrioics` |
| Database Password | `Ab8877Moain` |

## 📁 هيكل المشروع
```
SCAM/
├── apps/
│   ├── backend/          # Hono.js API Server
│   │   ├── src/
│   │   │   ├── db/       # Drizzle Schema & Connection
│   │   │   ├── lib/      # Utilities (supabase, logger)
│   │   │   ├── routes/   # API Routes
│   │   │   ├── middleware/
│   │   │   └── validators/
│   │   └── package.json
│   └── frontend/         # React + Vite
│       ├── src/
│       └── package.json
├── packages/             # Shared packages
└── package.json          # Root package.json (monorepo)
```

## ⚠️ ملاحظات مهمة

1. **Connection Pooler**: يجب استخدام المنفذ `6543` (Transaction Pooler) وليس `5432`
2. **SSL**: الاتصال يتطلب SSL مع `rejectUnauthorized: false`
3. **prepare: false**: مطلوب لـ Supabase Transaction Pooler
4. **SCAM_DATABASE_URL**: استخدم هذا المتغير بدلاً من DATABASE_URL لتجنب التعارض مع بيئات أخرى

## 🛠️ أوامر MCP مفيدة

```bash
# عرض الجداول
manus-mcp-cli tool call list_tables --server supabase --input '{"project_id": "hmqmtxgyuarccyrioics"}'

# تنفيذ SQL
manus-mcp-cli tool call execute_sql --server supabase --input '{"project_id": "hmqmtxgyuarccyrioics", "query": "SELECT * FROM users;"}'

# تطبيق migration
manus-mcp-cli tool call apply_migration --server supabase --input '{"project_id": "hmqmtxgyuarccyrioics", "name": "migration_name", "query": "CREATE TABLE..."}'
```

---

**تاريخ التسليم**: 2026-02-02
**آخر تحديث للمستودع**: ca8f60c
