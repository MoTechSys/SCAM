import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, gte, lte, desc, count } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const audit = new Hono();

audit.use('*', authMiddleware);

// Validators
const queryAuditSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  userId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ============================================
// GET /audit - سجلات التدقيق
// ============================================
audit.get('/', requirePermission('view_audit_logs'), zValidator('query', queryAuditSchema), async (c) => {
  const { page, limit, userId, action, entityType, entityId, startDate, endDate } = c.req.valid('query');

  const conditions = [];

  if (userId) conditions.push(eq(schema.auditLogs.userId, userId));
  if (action) conditions.push(eq(schema.auditLogs.action, action));
  if (entityType) conditions.push(eq(schema.auditLogs.entityType, entityType));
  if (entityId) conditions.push(eq(schema.auditLogs.entityId, entityId));
  if (startDate) conditions.push(gte(schema.auditLogs.createdAt, new Date(startDate)));
  if (endDate) conditions.push(lte(schema.auditLogs.createdAt, new Date(endDate)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ total }] = await db.select({ total: count() }).from(schema.auditLogs).where(whereClause);

  const offset = (page - 1) * limit;

  const logs = await db.query.auditLogs.findMany({
    where: whereClause,
    with: {
      user: { columns: { id: true, fullName: true, email: true, avatar: true } },
    },
    limit,
    offset,
    orderBy: [desc(schema.auditLogs.createdAt)],
  });

  return c.json({
    success: true,
    data: logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
  });
});

// ============================================
// GET /audit/actions - قائمة الإجراءات
// ============================================
audit.get('/actions', requirePermission('view_audit_logs'), async (c) => {
  const actions = await db
    .selectDistinct({ action: schema.auditLogs.action })
    .from(schema.auditLogs)
    .orderBy(schema.auditLogs.action);

  return c.json({ success: true, data: actions.map((a) => a.action) });
});

// ============================================
// GET /audit/entity-types - قائمة أنواع الكيانات
// ============================================
audit.get('/entity-types', requirePermission('view_audit_logs'), async (c) => {
  const types = await db
    .selectDistinct({ entityType: schema.auditLogs.entityType })
    .from(schema.auditLogs)
    .orderBy(schema.auditLogs.entityType);

  return c.json({ success: true, data: types.map((t) => t.entityType) });
});

// ============================================
// GET /audit/:id - سجل محدد
// ============================================
audit.get('/:id', requirePermission('view_audit_logs'), async (c) => {
  const id = c.req.param('id');

  const log = await db.query.auditLogs.findFirst({
    where: eq(schema.auditLogs.id, id),
    with: {
      user: { columns: { id: true, fullName: true, email: true, avatar: true } },
    },
  });

  if (!log) {
    return c.json({ success: false, error: 'السجل غير موجود' }, 404);
  }

  return c.json({ success: true, data: log });
});

export default audit;
