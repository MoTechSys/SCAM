// البيانات الثابتة للنموذج الأولي
// S-ACM Frontend Prototype

// ==================== المستخدمين ====================
export const users = [
  {
    id: 1,
    academic_id: "admin",
    full_name: "مدير النظام",
    email: "admin@sacm.edu",
    role: { id: 1, name: "مدير النظام", code: "admin" },
    major: null,
    level: null,
    status: "active",
    avatar: null,
    created_at: "2025-01-01",
  },
  {
    id: 2,
    academic_id: "202312345",
    full_name: "أحمد محمد علي",
    email: "ahmed@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 1, name: "علوم الحاسب" },
    level: { id: 3, name: "المستوى الثالث", number: 3 },
    status: "active",
    avatar: null,
    created_at: "2025-01-15",
  },
  {
    id: 3,
    academic_id: "202312346",
    full_name: "فاطمة أحمد",
    email: "fatima@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 1, name: "علوم الحاسب" },
    level: { id: 3, name: "المستوى الثالث", number: 3 },
    status: "active",
    avatar: null,
    created_at: "2025-01-15",
  },
  {
    id: 4,
    academic_id: "inst001",
    full_name: "د. محمد العلي",
    email: "dr.mohammed@sacm.edu",
    role: { id: 2, name: "مدرس", code: "instructor" },
    major: null,
    level: null,
    status: "active",
    avatar: null,
    created_at: "2025-01-10",
  },
  {
    id: 5,
    academic_id: "inst002",
    full_name: "د. سارة الأحمد",
    email: "dr.sara@sacm.edu",
    role: { id: 2, name: "مدرس", code: "instructor" },
    major: null,
    level: null,
    status: "active",
    avatar: null,
    created_at: "2025-01-10",
  },
  {
    id: 6,
    academic_id: "202312347",
    full_name: "خالد سعيد",
    email: "khaled@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 2, name: "نظم المعلومات" },
    level: { id: 2, name: "المستوى الثاني", number: 2 },
    status: "inactive",
    avatar: null,
    created_at: "2025-01-20",
  },
  {
    id: 7,
    academic_id: "202312348",
    full_name: "نورة عبدالله",
    email: "noura@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 1, name: "علوم الحاسب" },
    level: { id: 4, name: "المستوى الرابع", number: 4 },
    status: "active",
    avatar: null,
    created_at: "2025-01-18",
  },
  {
    id: 8,
    academic_id: "202312349",
    full_name: "عبدالرحمن سالم",
    email: "abdulrahman@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 2, name: "نظم المعلومات" },
    level: { id: 1, name: "المستوى الأول", number: 1 },
    status: "active",
    avatar: null,
    created_at: "2025-01-19",
  },
  {
    id: 9,
    academic_id: "202312350",
    full_name: "منى الشهري",
    email: "mona@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 3, name: "هندسة البرمجيات" },
    level: { id: 2, name: "المستوى الثاني", number: 2 },
    status: "active",
    avatar: null,
    created_at: "2025-01-19",
  },
  {
    id: 10,
    academic_id: "202312351",
    full_name: "يوسف العمري",
    email: "yousef@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 1, name: "علوم الحاسب" },
    level: { id: 5, name: "المستوى الخامس", number: 5 },
    status: "active",
    avatar: null,
    created_at: "2025-01-20",
  },
  {
    id: 11,
    academic_id: "202312352",
    full_name: "هند الزهراني",
    email: "hind@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 4, name: "الذكاء الاصطناعي" },
    level: { id: 3, name: "المستوى الثالث", number: 3 },
    status: "inactive",
    avatar: null,
    created_at: "2025-01-20",
  },
  {
    id: 12,
    academic_id: "202312353",
    full_name: "سلطان القحطاني",
    email: "sultan@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 2, name: "نظم المعلومات" },
    level: { id: 4, name: "المستوى الرابع", number: 4 },
    status: "active",
    avatar: null,
    created_at: "2025-01-21",
  },
  {
    id: 13,
    academic_id: "202312354",
    full_name: "ريم الدوسري",
    email: "reem@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 1, name: "علوم الحاسب" },
    level: { id: 6, name: "المستوى السادس", number: 6 },
    status: "active",
    avatar: null,
    created_at: "2025-01-21",
  },
  {
    id: 14,
    academic_id: "202312355",
    full_name: "ماجد الحربي",
    email: "majed@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 3, name: "هندسة البرمجيات" },
    level: { id: 7, name: "المستوى السابع", number: 7 },
    status: "active",
    avatar: null,
    created_at: "2025-01-22",
  },
  {
    id: 15,
    academic_id: "202312356",
    full_name: "لمى العتيبي",
    email: "lama@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 4, name: "الذكاء الاصطناعي" },
    level: { id: 1, name: "المستوى الأول", number: 1 },
    status: "active",
    avatar: null,
    created_at: "2025-01-22",
  },
  {
    id: 16,
    academic_id: "inst003",
    full_name: "د. عبدالله الغامدي",
    email: "dr.abdullah@sacm.edu",
    role: { id: 2, name: "مدرس", code: "instructor" },
    major: null,
    level: null,
    status: "active",
    avatar: null,
    created_at: "2025-01-10",
  },
  {
    id: 17,
    academic_id: "202312357",
    full_name: "فهد المالكي",
    email: "fahad@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 2, name: "نظم المعلومات" },
    level: { id: 8, name: "المستوى الثامن", number: 8 },
    status: "active",
    avatar: null,
    created_at: "2025-01-23",
  },
  {
    id: 18,
    academic_id: "202312358",
    full_name: "سارة الشمري",
    email: "sara.sh@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 1, name: "علوم الحاسب" },
    level: { id: 2, name: "المستوى الثاني", number: 2 },
    status: "inactive",
    avatar: null,
    created_at: "2025-01-23",
  },
  {
    id: 19,
    academic_id: "202312359",
    full_name: "تركي السبيعي",
    email: "turki@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 3, name: "هندسة البرمجيات" },
    level: { id: 5, name: "المستوى الخامس", number: 5 },
    status: "active",
    avatar: null,
    created_at: "2025-01-24",
  },
  {
    id: 20,
    academic_id: "202312360",
    full_name: "نوف الراشد",
    email: "nouf@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    major: { id: 4, name: "الذكاء الاصطناعي" },
    level: { id: 4, name: "المستوى الرابع", number: 4 },
    status: "active",
    avatar: null,
    created_at: "2025-01-24",
  },
];

export const deletedUsers = [
  {
    id: 100,
    academic_id: "202300001",
    full_name: "عمر حسن",
    email: "omar@sacm.edu",
    role: { id: 3, name: "طالب", code: "student" },
    deleted_at: "2025-01-25",
    deleted_by: "مدير النظام",
  },
];

// ==================== الأدوار ====================
export const roles = [
  {
    id: 1,
    name: "مدير النظام",
    code: "admin",
    description: "صلاحيات كاملة على النظام",
    is_system: true,
    users_count: 1,
    permissions: ["__all__"],
  },
  {
    id: 2,
    name: "مدرس",
    code: "instructor",
    description: "إدارة المقررات والملفات",
    is_system: true,
    users_count: 2,
    permissions: ["view_courses", "upload_files", "edit_files", "delete_files", "send_notifications"],
  },
  {
    id: 3,
    name: "طالب",
    code: "student",
    description: "عرض المقررات والملفات",
    is_system: true,
    users_count: 4,
    permissions: ["view_courses", "view_files", "download_files", "use_ai_summary", "use_ai_questions", "use_ai_chat"],
  },
  {
    id: 4,
    name: "مشرف قسم",
    code: "dept_supervisor",
    description: "إشراف على قسم معين",
    is_system: false,
    users_count: 0,
    permissions: ["view_users", "view_courses", "view_files", "view_statistics"],
  },
];

// ==================== الصلاحيات ====================
export const permissions = [
  // المستخدمين
  { id: 1, code: "view_users", name: "عرض المستخدمين", category: "users" },
  { id: 2, code: "create_user", name: "إضافة مستخدم", category: "users" },
  { id: 3, code: "edit_user", name: "تعديل مستخدم", category: "users" },
  { id: 4, code: "delete_user", name: "حذف مستخدم", category: "users" },
  { id: 5, code: "restore_user", name: "استعادة مستخدم", category: "users" },
  { id: 6, code: "permanent_delete_user", name: "حذف نهائي", category: "users" },
  { id: 7, code: "import_users", name: "استيراد مستخدمين", category: "users" },
  { id: 8, code: "export_users", name: "تصدير مستخدمين", category: "users" },
  { id: 9, code: "promote_students", name: "ترقية الطلاب", category: "users" },
  
  // الأدوار
  { id: 10, code: "view_roles", name: "عرض الأدوار", category: "roles" },
  { id: 11, code: "create_role", name: "إضافة دور", category: "roles" },
  { id: 12, code: "edit_role", name: "تعديل دور", category: "roles" },
  { id: 13, code: "delete_role", name: "حذف دور", category: "roles" },
  
  // المقررات
  { id: 14, code: "view_courses", name: "عرض المقررات", category: "courses" },
  { id: 15, code: "create_course", name: "إضافة مقرر", category: "courses" },
  { id: 16, code: "edit_course", name: "تعديل مقرر", category: "courses" },
  { id: 17, code: "delete_course", name: "حذف مقرر", category: "courses" },
  { id: 18, code: "assign_instructors", name: "تعيين مدرسين", category: "courses" },
  { id: 19, code: "assign_majors", name: "ربط تخصصات", category: "courses" },
  
  // الملفات
  { id: 20, code: "view_files", name: "عرض الملفات", category: "files" },
  { id: 21, code: "upload_files", name: "رفع ملفات", category: "files" },
  { id: 22, code: "edit_files", name: "تعديل ملفات", category: "files" },
  { id: 23, code: "delete_files", name: "حذف ملفات", category: "files" },
  { id: 24, code: "download_files", name: "تحميل ملفات", category: "files" },
  
  // البيانات الأكاديمية
  { id: 25, code: "manage_majors", name: "إدارة التخصصات", category: "academic" },
  { id: 26, code: "manage_levels", name: "إدارة المستويات", category: "academic" },
  { id: 27, code: "manage_semesters", name: "إدارة الفصول", category: "academic" },
  
  // الإشعارات
  { id: 28, code: "view_notifications", name: "عرض الإشعارات", category: "notifications" },
  { id: 29, code: "send_notifications", name: "إرسال إشعارات", category: "notifications" },
  { id: 30, code: "delete_notifications", name: "حذف إشعارات", category: "notifications" },
  
  // الذكاء الاصطناعي
  { id: 31, code: "use_ai_summary", name: "استخدام التلخيص", category: "ai" },
  { id: 32, code: "use_ai_questions", name: "استخدام الأسئلة", category: "ai" },
  { id: 33, code: "use_ai_chat", name: "استخدام المحادثة", category: "ai" },
  { id: 34, code: "view_ai_stats", name: "عرض إحصائيات AI", category: "ai" },
  { id: 35, code: "manage_ai_settings", name: "إدارة إعدادات AI", category: "ai" },
  
  // النظام
  { id: 36, code: "view_statistics", name: "عرض الإحصائيات", category: "system" },
  { id: 37, code: "view_audit_logs", name: "عرض سجلات التدقيق", category: "system" },
  { id: 38, code: "manage_settings", name: "إدارة الإعدادات", category: "system" },
  { id: 39, code: "manage_email_settings", name: "إعدادات البريد", category: "system" },
  { id: 40, code: "backup_system", name: "النسخ الاحتياطي", category: "system" },
];

export const permissionCategories = [
  { code: "users", name: "المستخدمين", icon: "Users" },
  { code: "roles", name: "الأدوار", icon: "Shield" },
  { code: "courses", name: "المقررات", icon: "Book" },
  { code: "files", name: "الملفات", icon: "Folder" },
  { code: "academic", name: "البيانات الأكاديمية", icon: "GraduationCap" },
  { code: "notifications", name: "الإشعارات", icon: "Bell" },
  { code: "ai", name: "الذكاء الاصطناعي", icon: "Sparkles" },
  { code: "system", name: "النظام", icon: "Settings" },
];

// ==================== التخصصات ====================
export const majors = [
  { id: 1, name: "علوم الحاسب", description: "قسم علوم الحاسب الآلي", students_count: 45, courses_count: 12, is_active: true },
  { id: 2, name: "نظم المعلومات", description: "قسم نظم المعلومات", students_count: 38, courses_count: 10, is_active: true },
  { id: 3, name: "هندسة البرمجيات", description: "قسم هندسة البرمجيات", students_count: 32, courses_count: 11, is_active: true },
  { id: 4, name: "الذكاء الاصطناعي", description: "قسم الذكاء الاصطناعي", students_count: 28, courses_count: 8, is_active: true },
];

// ==================== المستويات ====================
export const levels = [
  { id: 1, number: 1, name: "المستوى الأول", students_count: 50 },
  { id: 2, number: 2, name: "المستوى الثاني", students_count: 45 },
  { id: 3, number: 3, name: "المستوى الثالث", students_count: 42 },
  { id: 4, number: 4, name: "المستوى الرابع", students_count: 38 },
  { id: 5, number: 5, name: "المستوى الخامس", students_count: 35 },
  { id: 6, number: 6, name: "المستوى السادس", students_count: 30 },
  { id: 7, number: 7, name: "المستوى السابع", students_count: 25 },
  { id: 8, number: 8, name: "المستوى الثامن", students_count: 20 },
];

// ==================== الفصول الدراسية ====================
export const semesters = [
  { id: 1, name: "الفصل الأول 2024/2025", academic_year: "2024/2025", semester_number: 1, start_date: "2024-09-01", end_date: "2025-01-15", is_current: false },
  { id: 2, name: "الفصل الثاني 2024/2025", academic_year: "2024/2025", semester_number: 2, start_date: "2025-02-01", end_date: "2025-06-15", is_current: true },
  { id: 3, name: "الفصل الصيفي 2024/2025", academic_year: "2024/2025", semester_number: 3, start_date: "2025-07-01", end_date: "2025-08-15", is_current: false },
];

// ==================== المقررات ====================
export const courses = [
  {
    id: 1,
    code: "CS101",
    name: "مقدمة في البرمجة",
    description: "أساسيات البرمجة باستخدام Python",
    level: { id: 1, name: "المستوى الأول" },
    semester: { id: 2, name: "الفصل الثاني 2024/2025" },
    credit_hours: 3,
    instructors: [{ id: 4, name: "د. محمد العلي" }],
    majors: [{ id: 1, name: "علوم الحاسب" }, { id: 2, name: "نظم المعلومات" }],
    files_count: 15,
  },
  {
    id: 2,
    code: "CS201",
    name: "هياكل البيانات",
    description: "دراسة هياكل البيانات والخوارزميات",
    level: { id: 2, name: "المستوى الثاني" },
    semester: { id: 2, name: "الفصل الثاني 2024/2025" },
    credit_hours: 3,
    instructors: [{ id: 4, name: "د. محمد العلي" }],
    majors: [{ id: 1, name: "علوم الحاسب" }],
    files_count: 12,
  },
  {
    id: 3,
    code: "CS301",
    name: "قواعد البيانات",
    description: "تصميم وإدارة قواعد البيانات",
    level: { id: 3, name: "المستوى الثالث" },
    semester: { id: 2, name: "الفصل الثاني 2024/2025" },
    credit_hours: 3,
    instructors: [{ id: 5, name: "د. سارة الأحمد" }],
    majors: [{ id: 1, name: "علوم الحاسب" }, { id: 2, name: "نظم المعلومات" }],
    files_count: 18,
  },
  {
    id: 4,
    code: "CS401",
    name: "هندسة البرمجيات",
    description: "منهجيات تطوير البرمجيات",
    level: { id: 4, name: "المستوى الرابع" },
    semester: { id: 2, name: "الفصل الثاني 2024/2025" },
    credit_hours: 3,
    instructors: [{ id: 5, name: "د. سارة الأحمد" }],
    majors: [{ id: 1, name: "علوم الحاسب" }, { id: 3, name: "هندسة البرمجيات" }],
    files_count: 10,
  },
  {
    id: 5,
    code: "AI301",
    name: "مقدمة في الذكاء الاصطناعي",
    description: "أساسيات الذكاء الاصطناعي وتعلم الآلة",
    level: { id: 3, name: "المستوى الثالث" },
    semester: { id: 2, name: "الفصل الثاني 2024/2025" },
    credit_hours: 3,
    instructors: [{ id: 4, name: "د. محمد العلي" }, { id: 5, name: "د. سارة الأحمد" }],
    majors: [{ id: 4, name: "الذكاء الاصطناعي" }],
    files_count: 8,
  },
];

// ==================== الملفات ====================
export const files = [
  {
    id: 1,
    title: "المحاضرة الأولى - مقدمة في Python",
    description: "شرح أساسيات لغة Python",
    course: { id: 1, code: "CS101", name: "مقدمة في البرمجة" },
    file_type: "lecture",
    content_type: "local",
    file_extension: "pdf",
    file_size: 2500000,
    download_count: 45,
    uploaded_by: { id: 4, name: "د. محمد العلي" },
    created_at: "2025-01-20",
    is_hidden: false,
  },
  {
    id: 2,
    title: "المحاضرة الثانية - المتغيرات والأنواع",
    description: "شرح المتغيرات وأنواع البيانات",
    course: { id: 1, code: "CS101", name: "مقدمة في البرمجة" },
    file_type: "lecture",
    content_type: "local",
    file_extension: "pdf",
    file_size: 1800000,
    download_count: 38,
    uploaded_by: { id: 4, name: "د. محمد العلي" },
    created_at: "2025-01-22",
    is_hidden: false,
  },
  {
    id: 3,
    title: "ملخص الفصل الأول",
    description: "ملخص شامل للفصل الأول",
    course: { id: 1, code: "CS101", name: "مقدمة في البرمجة" },
    file_type: "summary",
    content_type: "local",
    file_extension: "pdf",
    file_size: 500000,
    download_count: 62,
    uploaded_by: { id: 4, name: "د. محمد العلي" },
    created_at: "2025-01-25",
    is_hidden: true,
  },
  {
    id: 4,
    title: "اختبار تجريبي",
    description: "اختبار تجريبي للفصل الأول",
    course: { id: 1, code: "CS101", name: "مقدمة في البرمجة" },
    file_type: "exam",
    content_type: "local",
    file_extension: "pdf",
    file_size: 300000,
    download_count: 55,
    uploaded_by: { id: 4, name: "د. محمد العلي" },
    created_at: "2025-01-26",
    is_hidden: false,
  },
  {
    id: 5,
    title: "فيديو شرح - Linked Lists",
    description: "شرح مفصل للقوائم المتصلة",
    course: { id: 2, code: "CS201", name: "هياكل البيانات" },
    file_type: "lecture",
    content_type: "external",
    external_url: "https://youtube.com/watch?v=example",
    download_count: 30,
    uploaded_by: { id: 4, name: "د. محمد العلي" },
    created_at: "2025-01-23",
    is_hidden: false,
  },
];

export const fileTypes = [
  { code: "lecture", name: "محاضرة", icon: "FileText" },
  { code: "summary", name: "ملخص", icon: "FileCheck" },
  { code: "exam", name: "اختبار", icon: "ClipboardList" },
  { code: "assignment", name: "واجب", icon: "FileEdit" },
  { code: "reference", name: "مرجع", icon: "BookOpen" },
  { code: "other", name: "أخرى", icon: "File" },
];

// ==================== الإشعارات ====================
export const notifications = [
  {
    id: 1,
    title: "تم رفع ملف جديد",
    content: "تم رفع المحاضرة الثانية في مقرر مقدمة في البرمجة",
    type: "file_upload",
    priority: "normal",
    is_read: false,
    created_at: "2025-01-28T10:30:00",
    sender: { id: 4, name: "د. محمد العلي" },
  },
  {
    id: 2,
    title: "إعلان هام",
    content: "سيتم تأجيل محاضرة يوم الأحد إلى يوم الاثنين",
    type: "announcement",
    priority: "high",
    is_read: false,
    created_at: "2025-01-27T14:00:00",
    sender: { id: 5, name: "د. سارة الأحمد" },
  },
  {
    id: 3,
    title: "تذكير بالاختبار",
    content: "تذكير: الاختبار الفصلي الأول يوم الخميس القادم",
    type: "announcement",
    priority: "urgent",
    is_read: true,
    created_at: "2025-01-25T09:00:00",
    sender: { id: 1, name: "مدير النظام" },
  },
];

export const notificationTypes = [
  { code: "general", name: "عام" },
  { code: "course", name: "مقرر" },
  { code: "file_upload", name: "رفع ملف" },
  { code: "announcement", name: "إعلان" },
  { code: "system", name: "نظام" },
];

export const notificationPriorities = [
  { code: "low", name: "منخفضة", color: "muted" },
  { code: "normal", name: "عادية", color: "info" },
  { code: "high", name: "عالية", color: "warning" },
  { code: "urgent", name: "عاجلة", color: "danger" },
];

// ==================== سجلات التدقيق ====================
export const auditLogs = [
  {
    id: 1,
    user: { id: 1, name: "مدير النظام" },
    action: "create",
    model: "User",
    details: "إنشاء مستخدم جديد: أحمد محمد",
    ip_address: "192.168.1.100",
    created_at: "2025-01-28T11:30:00",
  },
  {
    id: 2,
    user: { id: 4, name: "د. محمد العلي" },
    action: "upload",
    model: "File",
    details: "رفع ملف: المحاضرة الثانية",
    ip_address: "192.168.1.101",
    created_at: "2025-01-28T10:30:00",
  },
  {
    id: 3,
    user: { id: 1, name: "مدير النظام" },
    action: "update",
    model: "Settings",
    details: "تحديث إعدادات البريد الإلكتروني",
    ip_address: "192.168.1.100",
    created_at: "2025-01-27T15:00:00",
  },
  {
    id: 4,
    user: { id: 5, name: "د. سارة الأحمد" },
    action: "send",
    model: "Notification",
    details: "إرسال إشعار: إعلان هام",
    ip_address: "192.168.1.102",
    created_at: "2025-01-27T14:00:00",
  },
];

// ==================== إعدادات النظام ====================
export const systemSettings = {
  general: {
    site_name: "S-ACM",
    site_description: "نظام إدارة المحتوى الأكاديمي الذكي",
    timezone: "Asia/Riyadh",
    language: "ar",
  },
  email: {
    smtp_server: "smtp.gmail.com",
    smtp_port: 587,
    sender_email: "noreply@sacm.edu",
    use_tls: true,
  },
  ai: {
    provider: "gemini",
    api_key: "**********************",
    model: "gemini-2.0-flash",
    rate_limit: 10,
  },
  security: {
    max_login_attempts: 5,
    session_timeout: 60,
    allow_registration: false,
    require_otp: true,
  },
};

// ==================== إحصائيات ====================
export const dashboardStats = {
  total_users: 143,
  active_users: 128,
  total_courses: 25,
  total_files: 156,
  unread_notifications: 3,
  ai_requests_today: 45,
};

export const chartData = {
  userActivity: [
    { day: "السبت", count: 45 },
    { day: "الأحد", count: 52 },
    { day: "الاثنين", count: 48 },
    { day: "الثلاثاء", count: 61 },
    { day: "الأربعاء", count: 55 },
    { day: "الخميس", count: 38 },
    { day: "الجمعة", count: 25 },
  ],
  usersByRole: [
    { role: "طلاب", count: 120 },
    { role: "مدرسين", count: 15 },
    { role: "مدراء", count: 3 },
    { role: "مشرفين", count: 5 },
  ],
  topCourses: [
    { name: "مقدمة في البرمجة", downloads: 245 },
    { name: "قواعد البيانات", downloads: 198 },
    { name: "هياكل البيانات", downloads: 167 },
    { name: "هندسة البرمجيات", downloads: 134 },
    { name: "الذكاء الاصطناعي", downloads: 112 },
  ],
};

// ==================== المستخدم الحالي ====================
export const currentUser = {
  id: 1,
  academic_id: "admin",
  full_name: "مدير النظام",
  email: "admin@sacm.edu",
  role: { id: 1, name: "مدير النظام", code: "admin" },
  permissions: ["__all__"],
  avatar: null,
};

// دالة للتحقق من الصلاحية
export const hasPermission = (permission: string): boolean => {
  if (currentUser.permissions.includes("__all__")) return true;
  return currentUser.permissions.includes(permission);
};
