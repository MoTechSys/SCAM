/**
 * صفحة البيانات الأكاديمية
 * S-ACM Frontend - متصلة بـ Backend API
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { academicApi } from "@/lib/api";
import {
  GraduationCap,
  Layers,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Users,
  BookOpen,
  MoreVertical,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const pageTabs: Tab[] = [
  { id: "departments", label: "الأقسام", icon: Building2 },
  { id: "majors", label: "التخصصات", icon: GraduationCap },
  { id: "levels", label: "المستويات", icon: Layers },
];

interface Department {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  majorsCount: number;
  createdAt: string;
}

interface Major {
  id: string;
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  departmentName?: string;
  isActive: boolean;
  levelsCount: number;
  createdAt: string;
}

interface Level {
  id: string;
  name: string;
  number: number;
  majorId: string;
  majorName?: string;
  isActive: boolean;
  createdAt: string;
}

function AcademicContent() {
  const { activeTab, setTabs, setActiveTab } = useTabs();
  
  // State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    departmentId: "",
    majorId: "",
    number: 1,
  });

  useEffect(() => {
    setTabs(pageTabs);
    setActiveTab("departments");
  }, [setTabs, setActiveTab]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptRes, majorRes, levelRes] = await Promise.all([
        academicApi.getDepartments(),
        academicApi.getMajors(),
        academicApi.getLevels(),
      ]);
      
      if (deptRes.success) setDepartments(deptRes.data || []);
      if (majorRes.success) setMajors(majorRes.data || []);
      if (levelRes.success) setLevels(levelRes.data || []);
    } catch (error) {
      toast.error("فشل في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      departmentId: "",
      majorId: "",
      number: 1,
    });
    setEditItem(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (item: any, type: string) => {
    setEditItem({ ...item, type });
    setFormData({
      name: item.name || "",
      code: item.code || "",
      description: item.description || "",
      departmentId: item.departmentId || "",
      majorId: item.majorId || "",
      number: item.number || 1,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (activeTab === "departments") {
        if (editItem) {
          const res = await academicApi.updateDepartment(editItem.id, {
            name: formData.name,
            description: formData.description,
          });
          if (res.success) {
            toast.success("تم تحديث القسم بنجاح");
            fetchData();
          } else {
            toast.error(res.error || "فشل في تحديث القسم");
          }
        } else {
          const res = await academicApi.createDepartment({
            name: formData.name,
            description: formData.description,
          });
          if (res.success) {
            toast.success("تم إضافة القسم بنجاح");
            fetchData();
          } else {
            toast.error(res.error || "فشل في إضافة القسم");
          }
        }
      } else if (activeTab === "majors") {
        if (editItem) {
          const res = await academicApi.updateMajor(editItem.id, {
            name: formData.name,
            code: formData.code,
            description: formData.description,
            departmentId: formData.departmentId,
          });
          if (res.success) {
            toast.success("تم تحديث التخصص بنجاح");
            fetchData();
          } else {
            toast.error(res.error || "فشل في تحديث التخصص");
          }
        } else {
          const res = await academicApi.createMajor({
            name: formData.name,
            code: formData.code,
            description: formData.description,
            departmentId: formData.departmentId,
          });
          if (res.success) {
            toast.success("تم إضافة التخصص بنجاح");
            fetchData();
          } else {
            toast.error(res.error || "فشل في إضافة التخصص");
          }
        }
      } else if (activeTab === "levels") {
        if (editItem) {
          const res = await academicApi.updateLevel(editItem.id, {
            name: formData.name,
            number: formData.number,
            majorId: formData.majorId,
          });
          if (res.success) {
            toast.success("تم تحديث المستوى بنجاح");
            fetchData();
          } else {
            toast.error(res.error || "فشل في تحديث المستوى");
          }
        } else {
          const res = await academicApi.createLevel({
            name: formData.name,
            number: formData.number,
            majorId: formData.majorId,
          });
          if (res.success) {
            toast.success("تم إضافة المستوى بنجاح");
            fetchData();
          } else {
            toast.error(res.error || "فشل في إضافة المستوى");
          }
        }
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      let res;
      if (itemToDelete.type === "department") {
        res = await academicApi.deleteDepartment(itemToDelete.id);
      } else if (itemToDelete.type === "major") {
        res = await academicApi.deleteMajor(itemToDelete.id);
      } else if (itemToDelete.type === "level") {
        res = await academicApi.deleteLevel(itemToDelete.id);
      }
      
      if (res?.success) {
        toast.success("تم الحذف بنجاح");
        fetchData();
      } else {
        toast.error(res?.error || "فشل في الحذف");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = (item: any, type: string) => {
    setItemToDelete({ ...item, type });
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getDialogTitle = () => {
    const action = editItem ? "تعديل" : "إضافة";
    if (activeTab === "departments") return `${action} قسم`;
    if (activeTab === "majors") return `${action} تخصص`;
    return `${action} مستوى`;
  };

  return (
    <>
      {/* زر التحديث */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4 ml-2" />
          {activeTab === "departments" ? "إضافة قسم" : activeTab === "majors" ? "إضافة تخصص" : "إضافة مستوى"}
        </Button>
      </div>

      {/* الأقسام */}
      {activeTab === "departments" && (
        <div className="space-y-3">
          {departments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                لا توجد أقسام. اضغط على "إضافة قسم" لإنشاء قسم جديد.
              </CardContent>
            </Card>
          ) : (
            departments.map((dept) => (
              <Card key={dept.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{dept.name}</h3>
                        <p className="text-sm text-muted-foreground">{dept.description || "لا يوجد وصف"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <GraduationCap className="h-3 w-3 ml-1" />
                            {dept.majorsCount} تخصص
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(dept, "department")}>
                          <Pencil className="h-4 w-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => confirmDelete(dept, "department")}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* التخصصات */}
      {activeTab === "majors" && (
        <div className="space-y-3">
          {majors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                لا توجد تخصصات. اضغط على "إضافة تخصص" لإنشاء تخصص جديد.
              </CardContent>
            </Card>
          ) : (
            majors.map((major) => (
              <Card key={major.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <GraduationCap className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{major.name}</h3>
                          <Badge variant="outline" className="text-xs">{major.code}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{major.departmentName || "غير محدد"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Layers className="h-3 w-3 ml-1" />
                            {major.levelsCount} مستوى
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(major, "major")}>
                          <Pencil className="h-4 w-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => confirmDelete(major, "major")}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* المستويات */}
      {activeTab === "levels" && (
        <div className="space-y-3">
          {levels.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                لا توجد مستويات. اضغط على "إضافة مستوى" لإنشاء مستوى جديد.
              </CardContent>
            </Card>
          ) : (
            levels.map((level) => (
              <Card key={level.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Layers className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{level.name}</h3>
                        <p className="text-sm text-muted-foreground">{level.majorName || "غير محدد"}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          المستوى {level.number}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(level, "level")}>
                          <Pencil className="h-4 w-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => confirmDelete(level, "level")}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Dialog للإضافة/التعديل */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>
              {editItem ? "قم بتعديل البيانات" : "أدخل بيانات العنصر الجديد"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الاسم *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل الاسم"
              />
            </div>

            {activeTab === "majors" && (
              <>
                <div className="space-y-2">
                  <Label>الرمز *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="مثال: CS"
                  />
                </div>
                <div className="space-y-2">
                  <Label>القسم *</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {activeTab === "levels" && (
              <>
                <div className="space-y-2">
                  <Label>رقم المستوى *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>التخصص *</Label>
                  <Select
                    value={formData.majorId}
                    onValueChange={(value) => setFormData({ ...formData, majorId: value })}
                  >
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
              </>
            )}

            {(activeTab === "departments" || activeTab === "majors") && (
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف اختياري..."
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              {editItem ? "حفظ التغييرات" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog تأكيد الحذف */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{itemToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function Academic() {
  return (
    <DashboardLayout title="البيانات الأكاديمية" subtitle="إدارة الأقسام والتخصصات والمستويات">
      <AcademicContent />
    </DashboardLayout>
  );
}
