import { db } from './index.js';
import * as schema from './schema.js';
import bcrypt from 'bcryptjs';
import logger from '../lib/logger.js';

/**
 * Seed the database with initial data
 */
async function seed() {
  logger.info('🌱 Starting database seed...');

  try {
    // ============================================
    // 1. Seed Roles
    // ============================================
    logger.info('🎭 Seeding roles...');

    // All permissions for admin
    const allPermissions = [
      // Dashboard
      'view_dashboard',
      'view_dashboard_stats',
      'view_dashboard_charts',
      'view_recent_activity',
      // Users
      'view_users',
      'add_user',
      'edit_user',
      'delete_user',
      'change_user_role',
      'change_user_status',
      'reset_user_password',
      'export_users',
      // Roles
      'view_roles',
      'add_role',
      'edit_role',
      'delete_role',
      'manage_role_permissions',
      // Courses
      'view_courses',
      'view_all_courses',
      'add_course',
      'edit_course',
      'delete_course',
      'manage_course_files',
      'export_courses',
      // Files
      'view_files',
      'view_all_files',
      'upload_file',
      'download_file',
      'delete_file',
      'manage_file_categories',
      // Academic
      'view_academic',
      'manage_majors',
      'manage_levels',
      'manage_departments',
      // Notifications
      'view_notifications',
      'send_notification',
      'send_notification_all',
      'delete_notification',
      // AI
      'use_ai',
      'ai_summarize',
      'ai_generate_questions',
      'ai_chat',
      // Reports
      'view_reports',
      'export_reports',
      'view_user_reports',
      'view_course_reports',
      'view_file_reports',
      // Settings
      'view_settings',
      'edit_settings',
      'manage_system_settings',
      // Audit
      'view_audit_logs',
      'export_audit_logs',
      // Trash
      'view_trash',
      'restore_from_trash',
      'permanent_delete',
    ];

    // Instructor permissions
    const instructorPermissions = [
      'view_dashboard',
      'view_dashboard_stats',
      'view_courses',
      'view_all_courses',
      'add_course',
      'edit_course',
      'manage_course_files',
      'view_files',
      'upload_file',
      'download_file',
      'delete_file',
      'view_notifications',
      'send_notification',
      'use_ai',
      'ai_summarize',
      'ai_generate_questions',
      'view_reports',
      'view_course_reports',
    ];

    // Student permissions
    const studentPermissions = [
      'view_dashboard',
      'view_courses',
      'view_files',
      'download_file',
      'view_notifications',
      'use_ai',
      'ai_summarize',
    ];

    const adminRole = await db
      .insert(schema.roles)
      .values({
        name: 'مدير النظام',
        description: 'صلاحيات كاملة على النظام',
        permissions: allPermissions,
        isSystem: true,
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();

    await db
      .insert(schema.roles)
      .values({
        name: 'أستاذ',
        description: 'إدارة المقررات والملفات',
        permissions: instructorPermissions,
        isSystem: true,
        isActive: true,
      })
      .onConflictDoNothing();

    await db
      .insert(schema.roles)
      .values({
        name: 'طالب',
        description: 'عرض وتحميل المحتوى',
        permissions: studentPermissions,
        isSystem: true,
        isActive: true,
      })
      .onConflictDoNothing();

    logger.info('✅ Inserted 3 system roles');

    // ============================================
    // 2. Seed Departments
    // ============================================
    logger.info('🏛️ Seeding departments...');

    const depts = await db
      .insert(schema.departments)
      .values([
        { name: 'كلية الحاسب الآلي', description: 'كلية علوم الحاسب وتقنية المعلومات' },
        { name: 'كلية الهندسة', description: 'كلية الهندسة والتقنية' },
        { name: 'كلية العلوم', description: 'كلية العلوم الأساسية' },
      ])
      .onConflictDoNothing()
      .returning();

    logger.info('✅ Inserted departments');

    // ============================================
    // 3. Seed Majors
    // ============================================
    logger.info('🎓 Seeding majors...');

    const majorsData = await db
      .insert(schema.majors)
      .values([
        { name: 'علوم الحاسب', code: 'CS', departmentId: depts[0]?.id },
        { name: 'نظم المعلومات', code: 'IS', departmentId: depts[0]?.id },
        { name: 'هندسة البرمجيات', code: 'SE', departmentId: depts[0]?.id },
        { name: 'الذكاء الاصطناعي', code: 'AI', departmentId: depts[0]?.id },
      ])
      .onConflictDoNothing()
      .returning();

    logger.info('✅ Inserted majors');

    // ============================================
    // 4. Seed Levels
    // ============================================
    logger.info('📊 Seeding levels...');

    for (const major of majorsData) {
      await db
        .insert(schema.levels)
        .values([
          { name: 'المستوى الأول', number: 1, majorId: major.id },
          { name: 'المستوى الثاني', number: 2, majorId: major.id },
          { name: 'المستوى الثالث', number: 3, majorId: major.id },
          { name: 'المستوى الرابع', number: 4, majorId: major.id },
          { name: 'المستوى الخامس', number: 5, majorId: major.id },
          { name: 'المستوى السادس', number: 6, majorId: major.id },
          { name: 'المستوى السابع', number: 7, majorId: major.id },
          { name: 'المستوى الثامن', number: 8, majorId: major.id },
        ])
        .onConflictDoNothing();
    }

    logger.info('✅ Inserted levels');

    // ============================================
    // 5. Seed Admin User
    // ============================================
    logger.info('👤 Seeding admin user...');

    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    await db
      .insert(schema.users)
      .values({
        email: 'admin@s-acm.com',
        passwordHash: hashedPassword,
        fullName: 'مدير النظام',
        roleId: adminRole[0]?.id,
        isActive: true,
      })
      .onConflictDoNothing();

    logger.info('✅ Inserted admin user (admin@s-acm.com / Admin@123)');

    // ============================================
    // Done
    // ============================================
    logger.info('🎉 Database seed completed successfully!');
  } catch (error) {
    logger.error(`❌ Seed failed: ${String(error)}`);
    throw error;
  }
}

// Run seed
seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
