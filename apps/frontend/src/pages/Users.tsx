/**
 * صفحة إدارة المستخدمين
 * S-ACM Frontend - متصلة بـ Backend API
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileList, MobileSearch, MobileFilters } from "@/components/ui/mobile-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usersApi, rolesApi, academicApi, User, Role } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  List,
  UserPlus,
  Upload,
  TrendingUp,
  Trash2,
  Search,
  Eye,
  Pencil,
  RefreshCw,
  Download,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Key,
} from "lucide-react";
import { toast } from "sonner";

const pageTabs: Tab[] = [
  { id: "list", label: "قائمة المستخدمين", icon: List },
  { id: "add", label: "إضافة مستخدم", icon: UserPlus },
  { id: "import", label: "استيراد CSV", icon: Upload },
  { id: "promote", label: "ترقية الطلاب", icon: TrendingUp },
];

interface UserData {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  roleId?: string;
  roleName?: string;
  majorId?: string;
  majorName?: string;
  levelId?: string;
  levelName?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
}

function UsersContent() {
  const { activeTab, setTabs, setActiveTab } = useTabs();
  const { hasPermission } = useAuth();
  
  // State
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    password: "",
    roleId: "",
    majorId: "",
    levelId: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  
  // Edit dialog
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Delete dialog
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // تعيين التبويبات عند تحميل الصفحة
  useEffect(() => {
    setTabs(pageTabs);
    setActiveTab("list");
  }, [setTabs, setActiveTab]);

  // جلب البيانات
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      if (roleFilter !== "all") params.roleId = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      
      const response = await usersApi.getAll(params);
      if (response.success && response.data) {
        setUsers(response.data.data || response.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setUsers([]);
      }
    } catch (error) {
      toast.error("فشل في جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, roleFilter, statusFilter]);

  const fetchRoles = async () => {
    try {
      const response = await rolesApi.getAll();
      if (response.success && response.data) {
        setRoles(response.data.data || response.data || []);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error("Failed to fetch roles");
      setRoles([]);
    }
  };

  const fetchAcademic = async () => {
    try {
      const [majorsRes, levelsRes] = await Promise.all([
        academicApi.getMajors(),
        academicApi.getLevels(),
      ]);
      if (majorsRes.success && majorsRes.data) setMajors(majorsRes.data.data || majorsRes.data || []);
      if (levelsRes.success && levelsRes.data) setLevels(levelsRes.data.data || levelsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch academic data");
      setMajors([]);
      setLevels([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
    fetchAcademic();
  }, []);

  // إضافة مستخدم
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName || !formData.password || !formData.roleId) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    setFormLoading(true);
    try {
      const response = await usersApi.create({
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        password: formData.password,
        roleId: formData.roleId,
        majorId: formData.majorId || undefined,
        levelId: formData.levelId || undefined,
      } as any);

      if (response.success) {
        toast.success("تم إضافة المستخدم بنجاح");
        setFormData({ email: "", fullName: "", phone: "", password: "", roleId: "", majorId: "", levelId: "" });
        setActiveTab("list");
        fetchUsers();
      } else {
        toast.error(response.error || "فشل في إضافة المستخدم");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setFormLoading(false);
    }
  };

  // تعديل مستخدم
  const handleEditUser = async () => {
    if (!editUser) return;

    setFormLoading(true);
    try {
      const response = await usersApi.update(editUser.id, {
        email: editUser.email,
        fullName: editUser.fullName,
        phone: editUser.phone,
        roleId: editUser.roleId,
        majorId: editUser.majorId,
        levelId: editUser.levelId,
        isActive: editUser.isActive,
      } as any);

      if (response.success) {
        toast.success("تم تحديث المستخدم بنجاح");
        setEditDialogOpen(false);
        setEditUser(null);
        fetchUsers();
      } else {
        toast.error(response.error || "فشل في تحديث المستخدم");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setFormLoading(false);
    }
  };

  // حذف مستخدم
  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    setFormLoading(true);
    try {
      const response = await usersApi.delete(deleteUser.id);

      if (response.success) {
        toast.success("تم حذف المستخدم بنجاح");
        setDeleteDialogOpen(false);
        setDeleteUser(null);
        fetchUsers();
      } else {
        toast.error(response.error || "فشل في حذف المستخدم");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setFormLoading(false);
    }
  };

  // إعادة تعيين كلمة المرور
  const handleResetPassword = async (user: UserData) => {
    try {
      const response = await usersApi.resetPassword(user.id);
      if (response.success && response.data) {
        toast.success(`كلمة المرور الجديدة: ${response.data.temporaryPassword}`, {
          duration: 10000,
        });
      } else {
        toast.error(response.error || "فشل في إعادة تعيين كلمة المرور");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="badge-success text-[10px] px-1.5 py-0">نشط</Badge>;
      case "inactive":
        return <Badge className="badge-warning text-[10px] px-1.5 py-0">غير مفعل</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2);
  };

  // تحويل المستخدمين لعناصر القائمة المضغوطة
  const mobileUserItems = users.map((user) => ({
    id: user.id,
    title: user.fullName,
    subtitle: `${user.email} • ${user.roleName || ""}`,
    badge: getStatusBadge(user.status),
    avatar: (
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {getInitials(user.fullName)}
        </AvatarFallback>
      </Avatar>
    ),
    actions: [
      { label: "عرض", icon: <Eye className="h-4 w-4" />, onClick: () => toast.info(`عرض: ${user.fullName}`) },
      { label: "تعديل", icon: <Pencil className="h-4 w-4" />, onClick: () => { setEditUser(user); setEditDialogOpen(true); } },
      { label: "حذف", icon: <Trash2 className="h-4 w-4" />, onClick: () => { setDeleteUser(user); setDeleteDialogOpen(true); }, variant: "destructive" as const },
    ],
  }));

  // فلاتر الموبايل
  const mobileFilters = [
    { id: "all", label: "الكل", active: roleFilter === "all" },
    ...roles.map(role => ({ id: role.id, label: role.name, active: roleFilter === role.id })),
  ];

  const userColumns = [
    {
      key: "avatar",
      header: "",
      className: "w-12",
      render: (user: UserData) => (
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "fullName",
      header: "الاسم",
      render: (user: UserData) => (
        <div>
          <p className="font-medium">{user.fullName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "الدور",
      render: (user: UserData) => (
        <Badge variant="outline">{user.roleName || "-"}</Badge>
      ),
    },
    {
      key: "major",
      header: "التخصص",
      render: (user: UserData) => user.majorName || "-",
    },
    {
      key: "level",
      header: "المستوى",
      render: (user: UserData) => user.levelName || "-",
    },
    {
      key: "status",
      header: "الحالة",
      render: (user: UserData) => getStatusBadge(user.status),
    },
    {
      key: "actions",
      header: "الإجراءات",
      render: (user: UserData) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => toast.info(`عرض تفاصيل: ${user.fullName}`)}
            title="عرض"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-blue-500"
            onClick={() => { setEditUser(user); setEditDialogOpen(true); }}
            title="تعديل"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-yellow-500"
            onClick={() => handleResetPassword(user)}
            title="إعادة تعيين كلمة المرور"
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => { setDeleteUser(user); setDeleteDialogOpen(true); }}
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* قائمة المستخدمين */}
        {activeTab === "list" && (
          <div className="space-y-4">
            {/* الفلاتر */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث بالاسم أو البريد الإلكتروني..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأدوار</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير مفعل</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchUsers}>
                    <RefreshCw className="h-4 w-4 ml-2" />
                    تحديث
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* الجدول */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                columns={userColumns}
                data={users}
                keyExtractor={(user) => user.id}
                emptyMessage="لا يوجد مستخدمين"
                pagination={{
                  currentPage,
                  totalPages,
                  onPageChange: setCurrentPage,
                }}
              />
            )}
          </div>
        )}

        {/* إضافة مستخدم */}
        {activeTab === "add" && (
          <Card>
            <CardHeader>
              <CardTitle>إضافة مستخدم جديد</CardTitle>
              <CardDescription>أدخل بيانات المستخدم الجديد</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل *</Label>
                    <Input 
                      id="fullName" 
                      placeholder="الاسم الكامل"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input 
                      id="phone" 
                      placeholder="رقم الهاتف"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور *</Label>
                    <Input 
                      id="password" 
                      type="password"
                      placeholder="كلمة المرور"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">الدور *</Label>
                    <Select value={formData.roleId} onValueChange={(v) => setFormData({ ...formData, roleId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">التخصص</Label>
                    <Select value={formData.majorId} onValueChange={(v) => setFormData({ ...formData, majorId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التخصص" />
                      </SelectTrigger>
                      <SelectContent>
                        {majors.map((major) => (
                          <SelectItem key={major.id} value={major.id}>
                            {major.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">المستوى</Label>
                    <Select value={formData.levelId} onValueChange={(v) => setFormData({ ...formData, levelId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستوى" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("list")}>إلغاء</Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4 ml-2" />
                    )}
                    إضافة المستخدم
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* استيراد CSV */}
        {activeTab === "import" && (
          <Card>
            <CardHeader>
              <CardTitle>استيراد المستخدمين من ملف CSV</CardTitle>
              <CardDescription>قم برفع ملف CSV يحتوي على بيانات المستخدمين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">اسحب الملف هنا أو اضغط للاختيار</p>
                <p className="text-sm text-muted-foreground mb-4">يدعم ملفات CSV فقط (حد أقصى 5MB)</p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 ml-2" />
                  اختيار ملف
                </Button>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">تنسيق الملف المطلوب:</h4>
                <code className="text-sm text-muted-foreground">
                  البريد,الاسم_الكامل,كلمة_المرور,الدور,التخصص,المستوى
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ترقية الطلاب */}
        {activeTab === "promote" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>خيارات الترقية</CardTitle>
                <CardDescription>حدد التخصص والمستوى لترقية الطلاب</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>التخصص</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التخصص" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع التخصصات</SelectItem>
                        {majors.map((major) => (
                          <SelectItem key={major.id} value={major.id}>
                            {major.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>المستوى</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستوى" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع المستويات</SelectItem>
                        {levels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => toast.info("جاري البحث عن الطلاب...")}>
                    <Search className="h-4 w-4 ml-2" />
                    بحث
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-500">تحذير</p>
                  <p className="text-sm text-muted-foreground">
                    هذه العملية ستقوم بترقية الطلاب المحددين إلى المستوى التالي. 
                    الطلاب في المستوى الأخير سيتم تخريجهم.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-4">
        <MobileSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث عن مستخدم..."
        />
        <MobileFilters
          filters={mobileFilters}
          onFilterChange={(id) => setRoleFilter(id)}
        />
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <MobileList items={mobileUserItems} />
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>قم بتعديل بيانات المستخدم</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم الكامل</Label>
                <Input
                  value={editUser.fullName}
                  onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select 
                  value={editUser.roleId || ""} 
                  onValueChange={(v) => setEditUser({ ...editUser, roleId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select 
                  value={editUser.isActive ? "active" : "inactive"} 
                  onValueChange={(v) => setEditUser({ ...editUser, isActive: v === "active" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير مفعل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleEditUser} disabled={formLoading}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف المستخدم "{deleteUser?.fullName}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={formLoading}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Users() {
  return (
    <DashboardLayout title="إدارة المستخدمين">
      <UsersContent />
    </DashboardLayout>
  );
}
