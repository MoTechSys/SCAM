import { Hono } from 'hono';
import { eq, and, gte, isNull, count, sql, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const reports = new Hono();

reports.use('*', authMiddleware);

// ============================================
// GET /reports/dashboard - إحصائيات لوحة التحكم
// ============================================
reports.get('/dashboard', requirePermission('view_reports'), async (c) => {
  // Users stats
  const [usersStats] = await db
    .select({
      total: count(),
      active: sql<number>`COUNT(*) FILTER (WHERE ${schema.users.isActive} = true)`,
    })
    .from(schema.users)
    .where(isNull(schema.users.deletedAt));

  // Courses stats
  const [coursesStats] = await db
    .select({
      total: count(),
      active: sql<number>`COUNT(*) FILTER (WHERE ${schema.courses.isActive} = true)`,
    })
    .from(schema.courses)
    .where(isNull(schema.courses.deletedAt));

  // Files stats
  const [filesStats] = await db
    .select({
      total: count(),
      totalSize: sql<number>`COALESCE(SUM(${schema.files.size}), 0)`,
      totalDownloads: sql<number>`COALESCE(SUM(${schema.files.downloadsCount}), 0)`,
    })
    .from(schema.files)
    .where(isNull(schema.files.deletedAt));

  // New users this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ newUsersThisMonth }] = await db
    .select({ newUsersThisMonth: count() })
    .from(schema.users)
    .where(and(isNull(schema.users.deletedAt), gte(schema.users.createdAt, startOfMonth)));

  // Roles distribution
  const rolesDistribution = await db
    .select({
      roleId: schema.users.roleId,
      roleName: schema.roles.name,
      count: count(),
    })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(isNull(schema.users.deletedAt))
    .groupBy(schema.users.roleId, schema.roles.name);

  return c.json({
    success: true,
    data: {
      users: {
        total: usersStats.total,
        active: usersStats.active,
        newThisMonth: newUsersThisMonth,
      },
      courses: {
        total: coursesStats.total,
        active: coursesStats.active,
      },
      files: {
        total: filesStats.total,
        totalSize: filesStats.totalSize,
        totalDownloads: filesStats.totalDownloads,
      },
      rolesDistribution,
    },
  });
});

// ============================================
// GET /reports/users - تقارير المستخدمين
// ============================================
reports.get('/users', requirePermission('view_reports'), async (c) => {
  // Users by status (active/inactive)
  const byStatus = await db
    .select({
      status: sql<string>`CASE WHEN ${schema.users.isActive} = true THEN 'active' ELSE 'inactive' END`,
      count: count(),
    })
    .from(schema.users)
    .where(isNull(schema.users.deletedAt))
    .groupBy(schema.users.isActive);

  // Users by major
  const byMajor = await db
    .select({
      majorId: schema.users.majorId,
      majorName: schema.majors.name,
      count: count(),
    })
    .from(schema.users)
    .leftJoin(schema.majors, eq(schema.users.majorId, schema.majors.id))
    .where(isNull(schema.users.deletedAt))
    .groupBy(schema.users.majorId, schema.majors.name);

  // Users by level
  const byLevel = await db
    .select({
      levelId: schema.users.levelId,
      levelName: schema.levels.name,
      count: count(),
    })
    .from(schema.users)
    .leftJoin(schema.levels, eq(schema.users.levelId, schema.levels.id))
    .where(isNull(schema.users.deletedAt))
    .groupBy(schema.users.levelId, schema.levels.name);

  // Recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRegistrations = await db
    .select({
      date: sql<string>`DATE(${schema.users.createdAt})`,
      count: count(),
    })
    .from(schema.users)
    .where(and(isNull(schema.users.deletedAt), gte(schema.users.createdAt, thirtyDaysAgo)))
    .groupBy(sql`DATE(${schema.users.createdAt})`)
    .orderBy(sql`DATE(${schema.users.createdAt})`);

  return c.json({
    success: true,
    data: {
      byStatus,
      byMajor: byMajor.filter((m) => m.majorId),
      byLevel: byLevel.filter((l) => l.levelId),
      recentRegistrations,
    },
  });
});

// ============================================
// GET /reports/courses - تقارير المقررات
// ============================================
reports.get('/courses', requirePermission('view_reports'), async (c) => {
  // Courses by status (active/inactive)
  const byStatus = await db
    .select({
      status: sql<string>`CASE WHEN ${schema.courses.isActive} = true THEN 'active' ELSE 'inactive' END`,
      count: count(),
    })
    .from(schema.courses)
    .where(isNull(schema.courses.deletedAt))
    .groupBy(schema.courses.isActive);

  // Courses by major
  const byMajor = await db
    .select({
      majorId: schema.courses.majorId,
      majorName: schema.majors.name,
      count: count(),
    })
    .from(schema.courses)
    .leftJoin(schema.majors, eq(schema.courses.majorId, schema.majors.id))
    .where(isNull(schema.courses.deletedAt))
    .groupBy(schema.courses.majorId, schema.majors.name);

  // Courses by semester
  const bySemester = await db
    .select({
      semester: schema.courses.semester,
      count: count(),
    })
    .from(schema.courses)
    .where(isNull(schema.courses.deletedAt))
    .groupBy(schema.courses.semester);

  // Top courses by files
  const topByFiles = await db
    .select({
      courseId: schema.courses.id,
      courseName: schema.courses.name,
      courseCode: schema.courses.code,
      filesCount: count(schema.files.id),
    })
    .from(schema.courses)
    .leftJoin(schema.files, and(eq(schema.files.courseId, schema.courses.id), isNull(schema.files.deletedAt)))
    .where(isNull(schema.courses.deletedAt))
    .groupBy(schema.courses.id, schema.courses.name, schema.courses.code)
    .orderBy(desc(count(schema.files.id)))
    .limit(10);

  return c.json({
    success: true,
    data: {
      byStatus,
      byMajor,
      bySemester,
      topByFiles,
    },
  });
});

// ============================================
// GET /reports/files - تقارير الملفات
// ============================================
reports.get('/files', requirePermission('view_reports'), async (c) => {
  // Files by category
  const byCategory = await db
    .select({
      category: schema.files.category,
      count: count(),
      totalSize: sql<number>`COALESCE(SUM(${schema.files.size}), 0)`,
      totalDownloads: sql<number>`COALESCE(SUM(${schema.files.downloadsCount}), 0)`,
    })
    .from(schema.files)
    .where(isNull(schema.files.deletedAt))
    .groupBy(schema.files.category);

  // Files by mime type
  const byMimeType = await db
    .select({
      mimeType: schema.files.mimeType,
      count: count(),
      totalSize: sql<number>`COALESCE(SUM(${schema.files.size}), 0)`,
    })
    .from(schema.files)
    .where(isNull(schema.files.deletedAt))
    .groupBy(schema.files.mimeType)
    .orderBy(desc(count()))
    .limit(10);

  // Top downloaded files
  const topDownloaded = await db
    .select({
      id: schema.files.id,
      name: schema.files.name,
      downloads: schema.files.downloadsCount,
      courseName: schema.courses.name,
    })
    .from(schema.files)
    .leftJoin(schema.courses, eq(schema.files.courseId, schema.courses.id))
    .where(isNull(schema.files.deletedAt))
    .orderBy(desc(schema.files.downloadsCount))
    .limit(10);

  // Recent uploads (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUploads = await db
    .select({
      date: sql<string>`DATE(${schema.files.createdAt})`,
      count: count(),
      totalSize: sql<number>`COALESCE(SUM(${schema.files.size}), 0)`,
    })
    .from(schema.files)
    .where(and(isNull(schema.files.deletedAt), gte(schema.files.createdAt, thirtyDaysAgo)))
    .groupBy(sql`DATE(${schema.files.createdAt})`)
    .orderBy(sql`DATE(${schema.files.createdAt})`);

  return c.json({
    success: true,
    data: {
      byCategory,
      byMimeType,
      topDownloaded,
      recentUploads,
    },
  });
});

// ============================================
// GET /reports/activity - تقرير النشاط
// ============================================
reports.get('/activity', requirePermission('view_reports'), async (c) => {
  const days = parseInt(c.req.query('days') || '7', 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Activity by action
  const byAction = await db
    .select({
      action: schema.auditLogs.action,
      count: count(),
    })
    .from(schema.auditLogs)
    .where(gte(schema.auditLogs.createdAt, startDate))
    .groupBy(schema.auditLogs.action)
    .orderBy(desc(count()));

  // Activity by entity type
  const byEntityType = await db
    .select({
      entityType: schema.auditLogs.entityType,
      count: count(),
    })
    .from(schema.auditLogs)
    .where(gte(schema.auditLogs.createdAt, startDate))
    .groupBy(schema.auditLogs.entityType)
    .orderBy(desc(count()));

  // Daily activity
  const dailyActivity = await db
    .select({
      date: sql<string>`DATE(${schema.auditLogs.createdAt})`,
      count: count(),
    })
    .from(schema.auditLogs)
    .where(gte(schema.auditLogs.createdAt, startDate))
    .groupBy(sql`DATE(${schema.auditLogs.createdAt})`)
    .orderBy(sql`DATE(${schema.auditLogs.createdAt})`);

  // Most active users
  const mostActiveUsers = await db
    .select({
      userId: schema.auditLogs.userId,
      userName: schema.users.fullName,
      count: count(),
    })
    .from(schema.auditLogs)
    .leftJoin(schema.users, eq(schema.auditLogs.userId, schema.users.id))
    .where(gte(schema.auditLogs.createdAt, startDate))
    .groupBy(schema.auditLogs.userId, schema.users.fullName)
    .orderBy(desc(count()))
    .limit(10);

  return c.json({
    success: true,
    data: {
      period: { days, startDate, endDate: new Date() },
      byAction,
      byEntityType,
      dailyActivity,
      mostActiveUsers,
    },
  });
});

export default reports;
