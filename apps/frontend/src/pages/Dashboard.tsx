/**
 * لوحة التحكم الرئيسية
 * S-ACM Frontend - متصلة بـ Backend API
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api";
import {
  Users,
  UserCheck,
  BookOpen,
  FolderOpen,
  Sparkles,
  Activity,
  TrendingUp,
  Download,
  FileText,
  GraduationCap,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { toast } from "sonner";

const COLORS = ["#39ff14", "#22d3ee", "#a855f7", "#f59e0b", "#ef4444"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// مكون بطاقة إحصائية مصغرة جداً للموبايل
function MiniStatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
}: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div className="bg-card rounded-lg p-2 border border-border">
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className="p-1 rounded bg-primary/10">
          <Icon className="h-3 w-3 text-primary" />
        </div>
        <span className="text-[10px] text-muted-foreground truncate">{title}</span>
        {trend && (
          <span className={`text-[9px] mr-auto ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-base font-bold text-center">{value}</p>
    </div>
  );
}

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  courses: {
    total: number;
    active: number;
  };
  files: {
    total: number;
    totalSize: number;
    totalDownloads: number;
  };
  rolesDistribution: Array<{
    roleId: string;
    roleName: string;
    count: number;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportsApi.getDashboard();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error("فشل في جلب الإحصائيات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Prepare chart data from roles distribution
  const rolesChartData = stats?.rolesDistribution?.map((role, index) => ({
    name: role.roleName || "غير محدد",
    value: role.count,
    color: COLORS[index % COLORS.length],
  })) || [];

  if (loading) {
    return (
      <DashboardLayout title="لوحة التحكم" subtitle="نظرة عامة على النظام">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="لوحة التحكم" subtitle="نظرة عامة على النظام">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* زر التحديث */}
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>

        {/* بطاقات الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            title="إجمالي المستخدمين"
            value={stats?.users.total || 0}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            color="primary"
          />
          <StatCard
            title="المستخدمين النشطين"
            value={stats?.users.active || 0}
            icon={UserCheck}
            trend={{ value: 8, isPositive: true }}
            color="success"
          />
          <StatCard
            title="مستخدمين جدد"
            value={stats?.users.newThisMonth || 0}
            icon={TrendingUp}
            color="info"
          />
          <StatCard
            title="المقررات"
            value={stats?.courses.total || 0}
            icon={BookOpen}
            color="warning"
          />
          <StatCard
            title="الملفات"
            value={stats?.files.total || 0}
            icon={FolderOpen}
            color="primary"
          />
          <StatCard
            title="التحميلات"
            value={stats?.files.totalDownloads || 0}
            icon={Download}
            color="success"
          />
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* توزيع المستخدمين حسب الأدوار */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">توزيع المستخدمين حسب الأدوار</CardTitle>
              <CardDescription>نسبة المستخدمين في كل دور</CardDescription>
            </CardHeader>
            <CardContent>
              {rolesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={rolesChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {rolesChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  لا توجد بيانات
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {rolesChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات سريعة */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملخص سريع</CardTitle>
              <CardDescription>نظرة عامة على النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">المستخدمين</p>
                    <p className="text-sm text-muted-foreground">
                      {stats?.users.active || 0} نشط من {stats?.users.total || 0}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/50">
                  {stats?.users.total ? Math.round((stats.users.active / stats.users.total) * 100) : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">المقررات</p>
                    <p className="text-sm text-muted-foreground">
                      {stats?.courses.active || 0} نشط من {stats?.courses.total || 0}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-500 border-blue-500/50">
                  {stats?.courses.total ? Math.round((stats.courses.active / stats.courses.total) * 100) : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <FolderOpen className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">الملفات</p>
                    <p className="text-sm text-muted-foreground">
                      {stats?.files.total || 0} ملف • {formatFileSize(stats?.files.totalSize || 0)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-purple-500 border-purple-500/50">
                  {stats?.files.totalDownloads || 0} تحميل
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* روابط سريعة */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">روابط سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/users">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>المستخدمين</span>
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span>المقررات</span>
                </Button>
              </Link>
              <Link href="/files">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <FolderOpen className="h-6 w-6" />
                  <span>الملفات</span>
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Activity className="h-6 w-6" />
                  <span>التقارير</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-4">
        {/* إحصائيات مصغرة */}
        <div className="grid grid-cols-3 gap-2">
          <MiniStatCard
            title="المستخدمين"
            value={stats?.users.total || 0}
            icon={Users}
          />
          <MiniStatCard
            title="المقررات"
            value={stats?.courses.total || 0}
            icon={BookOpen}
          />
          <MiniStatCard
            title="الملفات"
            value={stats?.files.total || 0}
            icon={FolderOpen}
          />
        </div>

        {/* بطاقة ملخص */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm">نشطين</span>
              </div>
              <span className="font-medium">{stats?.users.active || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm">جدد هذا الشهر</span>
              </div>
              <span className="font-medium">{stats?.users.newThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-purple-500" />
                <span className="text-sm">التحميلات</span>
              </div>
              <span className="font-medium">{stats?.files.totalDownloads || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* روابط سريعة */}
        <div className="grid grid-cols-2 gap-2">
          <Link href="/users">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">المستخدمين</span>
                <ChevronRight className="h-4 w-4 mr-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/courses">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">المقررات</span>
                <ChevronRight className="h-4 w-4 mr-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/files">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">الملفات</span>
                <ChevronRight className="h-4 w-4 mr-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/reports">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">التقارير</span>
                <ChevronRight className="h-4 w-4 mr-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
