import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, or, desc, count, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import logger from '../lib/logger.js';

const notifications = new Hono();

notifications.use('*', authMiddleware);

// Validators
const createNotificationSchema = z.object({
  title: z.string().min(2, 'عنوان الإشعار مطلوب').max(255),
  message: z.string().min(1, 'محتوى الإشعار مطلوب'),
  type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
  recipientId: z.string().uuid().optional(),
});

const queryNotificationsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.enum(['info', 'warning', 'success', 'error']).optional(),
  isRead: z.coerce.boolean().optional(),
});

// ============================================
// GET /notifications - إشعاراتي
// ============================================
notifications.get('/', requirePermission('view_notifications'), zValidator('query', queryNotificationsSchema), async (c) => {
  const user = c.get('user');
  const { page, limit, type, isRead } = c.req.valid('query');

  const conditions = [
    or(
      eq(schema.notifications.recipientId, user.userId),
      isNull(schema.notifications.recipientId) // إشعارات للجميع
    ),
  ];

  if (type) conditions.push(eq(schema.notifications.type, type));
  if (isRead !== undefined) conditions.push(eq(schema.notifications.isRead, isRead));

  const [{ total }] = await db.select({ total: count() }).from(schema.notifications).where(and(...conditions));

  const offset = (page - 1) * limit;

  const notificationsList = await db
    .select({
      id: schema.notifications.id,
      title: schema.notifications.title,
      message: schema.notifications.message,
      type: schema.notifications.type,
      isRead: schema.notifications.isRead,
      readAt: schema.notifications.readAt,
      createdAt: schema.notifications.createdAt,
      senderId: schema.notifications.senderId,
      senderName: schema.users.fullName,
    })
    .from(schema.notifications)
    .leftJoin(schema.users, eq(schema.notifications.senderId, schema.users.id))
    .where(and(...conditions))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(limit)
    .offset(offset);

  // Count unread
  const [{ unreadCount }] = await db
    .select({ unreadCount: count() })
    .from(schema.notifications)
    .where(
      and(
        or(
          eq(schema.notifications.recipientId, user.userId),
          isNull(schema.notifications.recipientId)
        ),
        eq(schema.notifications.isRead, false)
      )
    );

  return c.json({
    success: true,
    data: notificationsList,
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
  });
});

// ============================================
// GET /notifications/sent - الإشعارات المرسلة
// ============================================
notifications.get('/sent', requirePermission('send_notification'), async (c) => {
  const user = c.get('user');

  const sent = await db
    .select({
      id: schema.notifications.id,
      title: schema.notifications.title,
      message: schema.notifications.message,
      type: schema.notifications.type,
      isRead: schema.notifications.isRead,
      createdAt: schema.notifications.createdAt,
      recipientId: schema.notifications.recipientId,
      recipientName: schema.users.fullName,
    })
    .from(schema.notifications)
    .leftJoin(schema.users, eq(schema.notifications.recipientId, schema.users.id))
    .where(eq(schema.notifications.senderId, user.userId))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(50);

  return c.json({ success: true, data: sent });
});

// ============================================
// POST /notifications - إرسال إشعار
// ============================================
notifications.post('/', requirePermission('send_notification'), zValidator('json', createNotificationSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  const [notification] = await db
    .insert(schema.notifications)
    .values({
      title: data.title,
      message: data.message,
      type: data.type,
      senderId: user.userId,
      recipientId: data.recipientId || null, // null = للجميع
    })
    .returning();

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'create',
    entityType: 'notification',
    entityId: notification.id,
    newValue: { title: data.title },
  });

  logger.info(`Notification sent: ${data.title} by ${user.email}`);

  return c.json({ success: true, data: notification, message: 'تم إرسال الإشعار بنجاح' }, 201);
});

// ============================================
// PUT /notifications/:id/read - تحديد كمقروء
// ============================================
notifications.put('/:id/read', requirePermission('view_notifications'), async (c) => {
  const id = c.req.param('id');

  const notification = await db.query.notifications.findFirst({
    where: eq(schema.notifications.id, id),
  });

  if (!notification) {
    return c.json({ success: false, error: 'الإشعار غير موجود' }, 404);
  }

  await db
    .update(schema.notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(schema.notifications.id, id));

  return c.json({ success: true, message: 'تم تحديد الإشعار كمقروء' });
});

// ============================================
// PUT /notifications/read-all - تحديد الكل كمقروء
// ============================================
notifications.put('/read-all', requirePermission('view_notifications'), async (c) => {
  const user = c.get('user');

  await db
    .update(schema.notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        or(
          eq(schema.notifications.recipientId, user.userId),
          isNull(schema.notifications.recipientId)
        ),
        eq(schema.notifications.isRead, false)
      )
    );

  return c.json({ success: true, message: 'تم تحديد جميع الإشعارات كمقروءة' });
});

// ============================================
// DELETE /notifications/:id - حذف إشعار
// ============================================
notifications.delete('/:id', requirePermission('delete_notification'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const notification = await db.query.notifications.findFirst({
    where: eq(schema.notifications.id, id),
  });

  if (!notification) {
    return c.json({ success: false, error: 'الإشعار غير موجود' }, 404);
  }

  await db.delete(schema.notifications).where(eq(schema.notifications.id, id));

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'delete',
    entityType: 'notification',
    entityId: id,
    oldValue: { title: notification.title },
  });

  return c.json({ success: true, message: 'تم حذف الإشعار بنجاح' });
});

export default notifications;
