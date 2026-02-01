import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import logger from '../lib/logger.js';

const settings = new Hono();

settings.use('*', authMiddleware);

// ============================================
// GET /settings - جميع الإعدادات
// ============================================
settings.get('/', requirePermission('view_settings'), async (c) => {
  const allSettings = await db.query.settings.findMany({
    orderBy: (s, { asc }) => [asc(s.category), asc(s.key)],
  });

  // Group by category
  const grouped = allSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = {};
    }
    acc[setting.category][setting.key] = setting.value;
    return acc;
  }, {} as Record<string, Record<string, any>>);

  return c.json({ success: true, data: grouped });
});

// ============================================
// GET /settings/:category - إعدادات فئة معينة
// ============================================
settings.get('/:category', requirePermission('view_settings'), async (c) => {
  const category = c.req.param('category');

  const categorySettings = await db.query.settings.findMany({
    where: eq(schema.settings.category, category),
  });

  const data = categorySettings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, any>);

  return c.json({ success: true, data });
});

// ============================================
// PUT /settings - تحديث إعدادات
// ============================================
const updateSettingsSchema = z.object({
  category: z.string().min(1),
  settings: z.record(z.any()),
});

settings.put('/', requirePermission('manage_settings'), zValidator('json', updateSettingsSchema), async (c) => {
  const user = c.get('user');
  const { category, settings: newSettings } = c.req.valid('json');

  const updates: Array<{ key: string; oldValue: any; newValue: any }> = [];

  for (const [key, value] of Object.entries(newSettings)) {
    // Check if setting exists
    const existing = await db.query.settings.findFirst({
      where: eq(schema.settings.key, key),
    });

    if (existing) {
      // Update existing
      await db
        .update(schema.settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(schema.settings.key, key));
      updates.push({ key, oldValue: existing.value, newValue: value });
    } else {
      // Insert new
      await db.insert(schema.settings).values({
        category,
        key,
        value,
      });
      updates.push({ key, oldValue: null, newValue: value });
    }
  }

  // Log audit
  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'update',
    entityType: 'settings',
    entityId: category,
    oldValue: updates.reduce((acc, u) => ({ ...acc, [u.key]: u.oldValue }), {}),
    newValue: newSettings,
  });

  logger.info(`Settings updated: ${category} by ${user.email}`);

  return c.json({ success: true, message: 'تم تحديث الإعدادات بنجاح' });
});

// ============================================
// GET /settings/public - الإعدادات العامة (بدون auth)
// ============================================
const publicSettings = new Hono();

publicSettings.get('/', async (c) => {
  const publicKeys = ['site_name', 'site_description', 'site_logo', 'primary_color', 'allow_registration'];

  const result: Record<string, any> = {};

  for (const key of publicKeys) {
    const setting = await db.query.settings.findFirst({
      where: eq(schema.settings.key, key),
    });
    if (setting) {
      result[key] = setting.value;
    }
  }

  return c.json({ success: true, data: result });
});

export { settings as default, publicSettings };
