import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  jsonb,
  index,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// 👤 Users Table (متوافق مع Supabase)
// ============================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    avatar: text('avatar'),
    studentId: varchar('student_id', { length: 50 }),
    roleId: uuid('role_id').references(() => roles.id),
    majorId: uuid('major_id').references(() => majors.id),
    levelId: uuid('level_id').references(() => levels.id),
    isActive: boolean('is_active').default(true),
    lastLogin: timestamp('last_login', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.roleId),
  })
);

// ============================================
// 🎭 Roles Table
// ============================================

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    permissions: jsonb('permissions').default([]),
    isSystem: boolean('is_system').default(false),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    nameIdx: uniqueIndex('roles_name_idx').on(table.name),
  })
);

// ============================================
// 🏛️ Departments Table
// ============================================

export const departments = pgTable(
  'departments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  }
);

// ============================================
// 🎓 Majors Table
// ============================================

export const majors = pgTable(
  'majors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 20 }),
    departmentId: uuid('department_id').references(() => departments.id),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    deptIdx: index('majors_department_idx').on(table.departmentId),
  })
);

// ============================================
// 📊 Levels Table
// ============================================

export const levels = pgTable(
  'levels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    number: integer('number').notNull(),
    majorId: uuid('major_id').references(() => majors.id),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    majorIdx: index('levels_major_idx').on(table.majorId),
  })
);

// ============================================
// 📚 Courses Table
// ============================================

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 20 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    creditHours: integer('credit_hours').default(3),
    majorId: uuid('major_id').references(() => majors.id),
    levelId: uuid('level_id').references(() => levels.id),
    instructorId: uuid('instructor_id').references(() => users.id),
    semester: varchar('semester', { length: 20 }),
    academicYear: varchar('academic_year', { length: 10 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    codeIdx: index('courses_code_idx').on(table.code),
    majorIdx: index('courses_major_idx').on(table.majorId),
    levelIdx: index('courses_level_idx').on(table.levelId),
  })
);

// ============================================
// 📁 Files Table
// ============================================

export const files = pgTable(
  'files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }),
    mimeType: varchar('mime_type', { length: 100 }),
    size: bigint('size', { mode: 'number' }).default(0),
    url: text('url').notNull(),
    storagePath: text('storage_path'),
    courseId: uuid('course_id').references(() => courses.id),
    uploaderId: uuid('uploader_id').references(() => users.id),
    category: varchar('category', { length: 50 }),
    description: text('description'),
    downloadsCount: integer('downloads_count').default(0),
    isPublic: boolean('is_public').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    courseIdx: index('files_course_idx').on(table.courseId),
    uploaderIdx: index('files_uploader_idx').on(table.uploaderId),
  })
);

// ============================================
// 🔔 Notifications Table
// ============================================

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    type: varchar('type', { length: 20 }).default('info'),
    senderId: uuid('sender_id').references(() => users.id),
    recipientId: uuid('recipient_id').references(() => users.id),
    isRead: boolean('is_read').default(false),
    readAt: timestamp('read_at', { withTimezone: true }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    senderIdx: index('notifications_sender_idx').on(table.senderId),
    recipientIdx: index('notifications_recipient_idx').on(table.recipientId),
  })
);

// ============================================
// 📝 Audit Logs Table
// ============================================

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    action: varchar('action', { length: 50 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: varchar('entity_id', { length: 50 }),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdx: index('audit_logs_user_idx').on(table.userId),
    actionIdx: index('audit_logs_action_idx').on(table.action),
  })
);

// ============================================
// 🔄 Refresh Tokens Table
// ============================================

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 500 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    tokenIdx: uniqueIndex('refresh_tokens_token_idx').on(table.token),
  })
);

// ============================================
// 🤖 AI Conversations Table
// ============================================

export const aiConversations = pgTable(
  'ai_conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: varchar('conversation_id', { length: 36 }).notNull(),
    userId: uuid('user_id').references(() => users.id),
    role: varchar('role', { length: 20 }).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    conversationIdx: index('ai_conversations_conversation_idx').on(table.conversationId),
    userIdx: index('ai_conversations_user_idx').on(table.userId),
  })
);

// ============================================
// ⚙️ Settings Table
// ============================================

export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 100 }).notNull(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: jsonb('value'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================
// 🔗 Relations
// ============================================

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  major: one(majors, {
    fields: [users.majorId],
    references: [majors.id],
  }),
  level: one(levels, {
    fields: [users.levelId],
    references: [levels.id],
  }),
  uploadedFiles: many(files),
  sentNotifications: many(notifications),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  majors: many(majors),
}));

export const majorsRelations = relations(majors, ({ one, many }) => ({
  department: one(departments, {
    fields: [majors.departmentId],
    references: [departments.id],
  }),
  levels: many(levels),
  courses: many(courses),
  users: many(users),
}));

export const levelsRelations = relations(levels, ({ one, many }) => ({
  major: one(majors, {
    fields: [levels.majorId],
    references: [majors.id],
  }),
  courses: many(courses),
  users: many(users),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  major: one(majors, {
    fields: [courses.majorId],
    references: [majors.id],
  }),
  level: one(levels, {
    fields: [courses.levelId],
    references: [levels.id],
  }),
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  course: one(courses, {
    fields: [files.courseId],
    references: [courses.id],
  }),
  uploader: one(users, {
    fields: [files.uploaderId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  sender: one(users, {
    fields: [notifications.senderId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
