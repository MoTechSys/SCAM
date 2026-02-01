/**
 * صفحة التقارير والإحصائيات
 * S-ACM Frontend - متصلة بـ Backend API
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { reportsApi } from "@/lib/api";
import {
  Users,
  BookOpen,
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  Activity,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

const pageTabs: Tab[] = [
  { id: "overview", label: "نظرة عامة", icon: BarChart3 },
  { id: "users", label: "المستخدمين", icon: Users },
  { id: "courses", label: "المقررات", icon: BookOpen },
  { id: "files", label: "الملفات", icon: FileText },
];

interface DashboardStats {
  users: { total: number; active: number; inactive: number };
  roles: { total: number };
  courses: { total: number };
  files: { total: number; totalSize: number };
  recentActivity: any[];
}

function ReportsContent() {
  const { activeTab, setTabs, setActiveTab } = useTabs();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [usersReport, setUsersReport] = useState<any>(null);
  const [coursesReport, setCoursesReport] = useState<any>(null);
  const [filesReport, setFilesReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTabs(pageTabs);
    if (!activeTab) setActiveTab("overview");
  }, [setTabs, setActiveTab]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, coursesRes, filesRes] = await Promise.all([
        reportsApi.getDashboard(),
        reportsApi.getUsers(),
        reportsApi.getCourses(),
        reportsApi.getFiles(),
      ]);
      
      if (dashRes.success) setDashboardStats(dashRes.data);
      if (usersRes.success) setUsersReport(usersRes.data);
      if (coursesRes.success) setCoursesReport(coursesRes.data);
      if (filesRes.success) setFilesReport(filesRes.data);
    } catch (error) {
      toast.error("فشل في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const exportReport = (type: string) => {
    toast.info(`جاري تصدير تقرير ${type}...`);
    // يمكن إضافة منطق التصدير هنا
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportReport(activeTab || "overview")}>
          <Download className="h-4 w-4 ml-2" />
          تصدير
        </Button>
      </div>

      {/* نظرة عامة */}
      {activeTab === "overview" && dashboardStats && (
        <div className="space-y-4">
          {/* الإحصائيات الرئيسية */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardStats.users.total}</p>
                    <p className="text-xs text-muted-foreground">إجمالي المستخدمين</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <UserCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardStats.users.active}</p>
                    <p className="text-xs text-muted-foreground">مستخدمين نشطين</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardStats.courses.total}</p>
                    <p className="text-xs text-muted-foreground">المقررات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardStats.files.total}</p>
                    <p className="text-xs text-muted-foreground">الملفات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* النشاط الأخير */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                النشاط الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {dashboardStats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.userName || activity.userEmail}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">لا يوجد نشاط حديث</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* تقرير المستخدمين */}
      {activeTab === "users" && usersReport && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{usersReport.total || 0}</p>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{usersReport.active || 0}</p>
                <p className="text-sm text-muted-foreground">نشط</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <UserX className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{usersReport.inactive || 0}</p>
                <p className="text-sm text-muted-foreground">غير نشط</p>
              </CardContent>
            </Card>
          </div>

          {/* توزيع حسب الأدوار */}
          {usersReport.byRole && usersReport.byRole.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">توزيع المستخدمين حسب الدور</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usersReport.byRole.map((role: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{role.roleName || role.name}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.count}</span>
                        <span className="text-muted-foreground text-sm">
                          ({((role.count / usersReport.total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* تقرير المقررات */}
      {activeTab === "courses" && coursesReport && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{coursesReport.total || 0}</p>
                <p className="text-sm text-muted-foreground">إجمالي المقررات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{coursesReport.totalFiles || 0}</p>
                <p className="text-sm text-muted-foreground">إجمالي الملفات</p>
              </CardContent>
            </Card>
          </div>

          {/* توزيع حسب التخصص */}
          {coursesReport.byMajor && coursesReport.byMajor.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">توزيع المقررات حسب التخصص</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coursesReport.byMajor.map((major: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{major.majorName || major.name}</span>
                      <Badge>{major.count} مقرر</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* تقرير الملفات */}
      {activeTab === "files" && filesReport && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">{filesReport.total || 0}</p>
                <p className="text-sm text-muted-foreground">إجمالي الملفات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{formatFileSize(filesReport.totalSize || 0)}</p>
                <p className="text-sm text-muted-foreground">الحجم الإجمالي</p>
              </CardContent>
            </Card>
          </div>

          {/* توزيع حسب النوع */}
          {filesReport.byType && filesReport.byType.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">توزيع الملفات حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filesReport.byType.map((type: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{type.type || type.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge>{type.count} ملف</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(type.totalSize || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

export default function Reports() {
  return (
    <DashboardLayout title="التقارير" subtitle="إحصائيات وتقارير النظام">
      <ReportsContent />
    </DashboardLayout>
  );
}
