/**
 * صفحة إدارة المقررات
 * S-ACM Frontend - متصلة بـ Backend API
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { coursesApi, academicApi, usersApi } from "@/lib/api";
import {
  List,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  FolderOpen,
  Users,
  RefreshCw,
  MoreVertical,
  BookOpen,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const pageTabs: Tab[] = [
  { id: "list", label: "قائمة المقررات", icon: List },
  { id: "add", label: "إضافة مقرر", icon: Plus },
];

interface CourseData {
  id: string;
  code: string;
  name: string;
  description?: string;
  creditHours: number;
  majorId?: string;
  majorName?: string;
  levelId?: string;
  levelName?: string;
  instructorId?: string;
  instructorName?: string;
  semester: string;
  academicYear: string;
  isActive: boolean;
  filesCount: number;
  createdAt: string;
}

const semesterOptions = [
  { value: "first", label: "الفصل الأول" },
  { value: "second", label: "الفصل الثاني" },
  { value: "summer", label: "الفصل الصيفي" },
];

function CoursesContent() {
  const { activeTab, setTabs, setActiveTab } = useTabs();
  const [, setLocation] = useLocation();
  
  // State
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    creditHours: 3,
    majorId: "",
    levelId: "",
    instructorId: "",
    semester: "first",
    academicYear: new Date().getFullYear().toString(),
  });
  const [formLoading, setFormLoading] = useState(false);
  
  // Edit dialog
  const [editCourse, setEditCourse] = useState<CourseData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Delete dialog
  const [deleteCourse, setDeleteCourse] = useState<CourseData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setTabs(pageTabs);
    setActiveTab("list");
  }, [setTabs, setActiveTab]);

  // جلب البيانات
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      if (semesterFilter !== "all") params.semester = semesterFilter;
      if (levelFilter !== "all") params.levelId = levelFilter;
      
      const response = await coursesApi.getAll();
      if (response.success && response.data) {
        setCourses(response.data.data || response.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setCourses([]);
      }
    } catch (error) {
      toast.error("فشل في جلب المقررات");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, semesterFilter, levelFilter]);

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
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await usersApi.getAll({ limit: 100 });
      if (response.success && response.data) {
        const usersData = response.data.data || response.data || [];
        // Filter instructors (users with instructor role)
        setInstructors(usersData.filter((u: any) => 
          u.roleName?.includes("مدرس") || u.roleName?.includes("دكتور") || u.roleName?.includes("أستاذ")
        ));
      }
    } catch (error) {
      console.error("Failed to fetch instructors");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchAcademic();
    fetchInstructors();
  }, []);

  // Filter courses locally
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.includes(searchQuery) || course.code.includes(searchQuery);
    const matchesSemester = semesterFilter === "all" || course.semester === semesterFilter;
    const matchesLevel = levelFilter === "all" || course.levelId === levelFilter;
    return matchesSearch && matchesSemester && matchesLevel;
  });

  // إضافة مقرر
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.majorId || !formData.levelId) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    setFormLoading(true);
    try {
      const response = await coursesApi.create({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        creditHours: formData.creditHours,
        majorId: formData.majorId,
        levelId: formData.levelId,
        instructorId: formData.instructorId || undefined,
        semester: formData.semester,
        academicYear: formData.academicYear,
      });

      if (response.success) {
        toast.success("تم إضافة المقرر بنجاح");
        setFormData({
          code: "", name: "", description: "", creditHours: 3,
          majorId: "", levelId: "", instructorId: "",
          semester: "first", academicYear: new Date().getFullYear().toString(),
        });
        setActiveTab("list");
        fetchCourses();
      } else {
        const errorMsg = typeof response.error === 'string' ? response.error : "فشل في إضافة المقرر";
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setFormLoading(false);
    }
  };

  // تعديل مقرر
  const handleEditCourse = async () => {
    if (!editCourse) return;

    setFormLoading(true);
    try {
      const response = await coursesApi.update(editCourse.id, {
        code: editCourse.code,
        name: editCourse.name,
        description: editCourse.description,
        creditHours: editCourse.creditHours,
        majorId: editCourse.majorId,
        levelId: editCourse.levelId,
        instructorId: editCourse.instructorId,
        semester: editCourse.semester,
        academicYear: editCourse.academicYear,
        isActive: editCourse.isActive,
      });

      if (response.success) {
        toast.success("تم تحديث المقرر بنجاح");
        setEditDialogOpen(false);
        setEditCourse(null);
        fetchCourses();
      } else {
        const errorMsg = typeof response.error === 'string' ? response.error : "فشل في تحديث المقرر";
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setFormLoading(false);
    }
  };

  // حذف مقرر
  const handleDeleteCourse = async () => {
    if (!deleteCourse) return;

    setFormLoading(true);
    try {
      const response = await coursesApi.delete(deleteCourse.id);

      if (response.success) {
        toast.success("تم حذف المقرر بنجاح");
        setDeleteDialogOpen(false);
        setDeleteCourse(null);
        fetchCourses();
      } else {
        const errorMsg = typeof response.error === 'string' ? response.error : "فشل في حذف المقرر";
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setFormLoading(false);
    }
  };

  const getSemesterLabel = (value: string) => {
    return semesterOptions.find(s => s.value === value)?.label || value;
  };

  return (
    <>
      {/* قائمة المقررات */}
      {activeTab === "list" && (
        <div className="space-y-3">
          {/* البحث والفلاتر */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث بالاسم أو الرمز..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="الفصل الدراسي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفصول</SelectItem>
                    {semesterOptions.map((sem) => (
                      <SelectItem key={sem.value} value={sem.value}>
                        {sem.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="المستوى" />
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
                <Button variant="outline" onClick={fetchCourses}>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تحديث
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* قائمة المقررات - موبايل */}
              <div className="lg:hidden space-y-2">
                {filteredCourses.map((course) => (
                  <Card 
                    key={course.id} 
                    className="card-hover cursor-pointer"
                    onClick={() => setLocation(`/course/${course.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-[10px] px-1.5">
                              {course.code}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{course.levelName}</span>
                          </div>
                          <h3 className="font-medium text-sm truncate">{course.name}</h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {course.instructorName || "-"}
                            </span>
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {course.filesCount}
                            </span>
                            <span>{getSemesterLabel(course.semester)}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setLocation(`/course/${course.id}`); }}>
                              <Eye className="h-4 w-4 ml-2" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditCourse(course); setEditDialogOpen(true); }}>
                              <Pencil className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); setDeleteCourse(course); setDeleteDialogOpen(true); }}
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
                ))}
              </div>

              {/* جدول المقررات - Desktop */}
              <Card className="hidden lg:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-right p-4 font-medium">الرمز</th>
                          <th className="text-right p-4 font-medium">اسم المقرر</th>
                          <th className="text-right p-4 font-medium">المستوى</th>
                          <th className="text-right p-4 font-medium">الفصل</th>
                          <th className="text-right p-4 font-medium">المدرس</th>
                          <th className="text-right p-4 font-medium">الملفات</th>
                          <th className="text-right p-4 font-medium">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.map((course) => (
                          <tr 
                            key={course.id} 
                            className="border-t border-border hover:bg-muted/30 cursor-pointer"
                            onClick={() => setLocation(`/course/${course.id}`)}
                          >
                            <td className="p-4">
                              <Badge variant="outline" className="font-mono">
                                {course.code}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{course.name}</p>
                                  <p className="text-sm text-muted-foreground">{course.creditHours} ساعات</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground">{course.levelName || "-"}</td>
                            <td className="p-4 text-muted-foreground">{getSemesterLabel(course.semester)}</td>
                            <td className="p-4 text-muted-foreground">{course.instructorName || "-"}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                <span>{course.filesCount}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                  onClick={() => setLocation(`/course/${course.id}`)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                  onClick={() => { setEditCourse(course); setEditDialogOpen(true); }}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                                  onClick={() => { setDeleteCourse(course); setDeleteDialogOpen(true); }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {filteredCourses.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد مقررات</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* إضافة مقرر */}
      {activeTab === "add" && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة مقرر جديد</CardTitle>
            <CardDescription>أدخل بيانات المقرر الجديد</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCourse} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="code">رمز المقرر *</Label>
                  <Input 
                    id="code" 
                    placeholder="مثال: CS101"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المقرر *</Label>
                  <Input 
                    id="name" 
                    placeholder="اسم المقرر"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditHours">الساعات المعتمدة</Label>
                  <Select 
                    value={String(formData.creditHours)} 
                    onValueChange={(v) => setFormData({ ...formData, creditHours: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((h) => (
                        <SelectItem key={h} value={String(h)}>{h} ساعات</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">التخصص *</Label>
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
                  <Label htmlFor="level">المستوى *</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="semester">الفصل الدراسي *</Label>
                  <Select value={formData.semester} onValueChange={(v) => setFormData({ ...formData, semester: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {semesterOptions.map((sem) => (
                        <SelectItem key={sem.value} value={sem.value}>
                          {sem.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">السنة الأكاديمية</Label>
                  <Input 
                    id="academicYear" 
                    placeholder="2025"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">المدرس</Label>
                  <Select value={formData.instructorId} onValueChange={(v) => setFormData({ ...formData, instructorId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدرس" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea 
                    id="description" 
                    placeholder="وصف المقرر..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setActiveTab("list")}>إلغاء</Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 ml-2" />
                  )}
                  إضافة المقرر
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل المقرر</DialogTitle>
            <DialogDescription>قم بتعديل بيانات المقرر</DialogDescription>
          </DialogHeader>
          {editCourse && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رمز المقرر</Label>
                <Input
                  value={editCourse.code}
                  onChange={(e) => setEditCourse({ ...editCourse, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>اسم المقرر</Label>
                <Input
                  value={editCourse.name}
                  onChange={(e) => setEditCourse({ ...editCourse, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الفصل الدراسي</Label>
                <Select 
                  value={editCourse.semester} 
                  onValueChange={(v) => setEditCourse({ ...editCourse, semester: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.map((sem) => (
                      <SelectItem key={sem.value} value={sem.value}>
                        {sem.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select 
                  value={editCourse.isActive ? "active" : "inactive"} 
                  onValueChange={(v) => setEditCourse({ ...editCourse, isActive: v === "active" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleEditCourse} disabled={formLoading}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المقرر</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف المقرر "{deleteCourse?.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteCourse} disabled={formLoading}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Courses() {
  return (
    <DashboardLayout title="إدارة المقررات">
      <CoursesContent />
    </DashboardLayout>
  );
}
