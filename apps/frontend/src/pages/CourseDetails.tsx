/**
 * صفحة تفاصيل المقرر
 * S-ACM Frontend - تعرض الملفات والطلاب والإحصائيات داخل المقرر
 */

import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courses, files, users, fileTypes } from "@/data/mockData";
import {
  ArrowRight,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Download,
  Upload,
  FileText,
  FileCheck,
  ClipboardList,
  FileEdit,
  BookOpen,
  File,
  MoreVertical,
  Link,
  EyeOff,
  RefreshCw,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Mail,
  Phone,
  Play,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const pageTabs: Tab[] = [
  { id: "files", label: "الملفات", icon: FolderOpen },
  { id: "students", label: "الطلاب", icon: Users },
  { id: "stats", label: "الإحصائيات", icon: BarChart3 },
  { id: "settings", label: "إعدادات المقرر", icon: Settings },
];

// أيقونات أنواع الملفات
const fileTypeIcons: Record<string, React.ElementType> = {
  lecture: FileText,
  summary: FileCheck,
  exam: ClipboardList,
  assignment: FileEdit,
  reference: BookOpen,
  other: File,
};

function CourseDetailsContent() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { activeTab, setTabs, setActiveTab } = useTabs();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // البحث عن المقرر
  const courseId = parseInt(params.id || "0");
  const course = courses.find((c) => c.id === courseId);

  // ملفات هذا المقرر
  const courseFiles = files.filter((f) => f.course?.id === courseId);
  
  // طلاب هذا المقرر (محاكاة - الطلاب المسجلين في تخصصات المقرر)
  const courseStudents = users.filter(
    (u) => u.role.code === "student" && course?.majors.some((m) => m.id === u.major?.id)
  );

  useEffect(() => {
    setTabs(pageTabs);
    setActiveTab("files");
  }, [setTabs, setActiveTab]);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">المقرر غير موجود</p>
        <Button onClick={() => setLocation("/courses")}>
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للمقررات
        </Button>
      </div>
    );
  }

  const filteredFiles = courseFiles.filter((file) => {
    const matchesSearch = file.title.includes(searchQuery);
    const matchesType = selectedFileType === "all" || file.file_type === selectedFileType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      {/* رأس الصفحة - معلومات المقرر */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex-shrink-0 mt-1"
              onClick={() => setLocation("/courses")}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono">{course.code}</Badge>
                <Badge className="badge-success">{course.level.name}</Badge>
              </div>
              <h1 className="text-xl font-bold mb-1">{course.name}</h1>
              <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {course.semester.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.credit_hours} ساعات
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.instructors.map((i) => i.name).join("، ")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تبويب الملفات */}
      {activeTab === "files" && (
        <div className="space-y-3">
          {/* شريط الأدوات */}
          <Card>
            <CardContent className="p-3 lg:p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث في الملفات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 h-9 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                    <SelectTrigger className="h-9 w-32 lg:w-40 text-sm">
                      <SelectValue placeholder="نوع الملف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      {fileTypes.map((type) => (
                        <SelectItem key={type.code} value={type.code}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="h-9">
                        <Upload className="h-4 w-4 ml-2" />
                        <span className="hidden sm:inline">رفع ملف</span>
                        <span className="sm:hidden">رفع</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>رفع ملف جديد</DialogTitle>
                        <DialogDescription>
                          رفع ملف جديد إلى مقرر {course.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>عنوان الملف *</Label>
                          <Input placeholder="مثال: المحاضرة الأولى" />
                        </div>
                        <div className="space-y-2">
                          <Label>نوع الملف *</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع الملف" />
                            </SelectTrigger>
                            <SelectContent>
                              {fileTypes.map((type) => (
                                <SelectItem key={type.code} value={type.code}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>الوصف</Label>
                          <Textarea placeholder="وصف مختصر للملف..." />
                        </div>
                        <div className="space-y-2">
                          <Label>الملف *</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              اسحب الملف هنا أو اضغط للاختيار
                            </p>
                            <Input type="file" className="hidden" />
                            <Button variant="outline" size="sm" className="mt-2">
                              اختيار ملف
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                          إلغاء
                        </Button>
                        <Button onClick={() => {
                          toast.success("تم رفع الملف بنجاح");
                          setIsUploadDialogOpen(false);
                        }}>
                          رفع الملف
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* جدول الملفات */}
          {filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">لا توجد ملفات في هذا المقرر</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 ml-2" />
                  رفع أول ملف
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-right p-4 font-medium w-12"></th>
                        <th className="text-right p-4 font-medium">العنوان</th>
                        <th className="text-right p-4 font-medium">النوع</th>
                        <th className="text-right p-4 font-medium">المصدر</th>
                        <th className="text-right p-4 font-medium">التحميلات</th>
                        <th className="text-right p-4 font-medium">رفع بواسطة</th>
                        <th className="text-right p-4 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => {
                        const FileIcon = fileTypeIcons[file.file_type] || File;
                        const fileType = fileTypes.find((t) => t.code === file.file_type);
                        return (
                          <tr key={file.id} className="border-t border-border hover:bg-muted/30">
                            <td className="p-4">
                              <div className={`p-2 rounded-lg ${file.is_hidden ? 'bg-muted/50 opacity-50' : 'bg-primary/10'}`}>
                                <FileIcon className={`h-5 w-5 ${file.is_hidden ? 'text-muted-foreground' : 'text-primary'}`} />
                              </div>
                            </td>
                            <td className="p-4">
                              <div className={file.is_hidden ? 'opacity-60' : ''}>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{file.title}</p>
                                  {file.is_hidden && (
                                    <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500">
                                      <EyeOff className="h-3 w-3 ml-1" />
                                      مخفي
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {course.code} - {course.name}
                                </p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">
                                {fileType?.name || file.file_type}
                              </Badge>
                            </td>
                            <td className="p-4">
                              {file.content_type === "external" ? (
                                <Badge className="badge-info text-xs">
                                  <Link className="h-3 w-3 ml-1" />
                                  رابط خارجي
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {formatFileSize(file.file_size || 0)}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Download className="h-4 w-4" />
                                <span>{file.download_count}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-muted-foreground">
                                {file.uploaded_by?.name || 'غير محدد'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                {/* حذف */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => toast.success('تم حذف الملف')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {/* تعديل */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                  onClick={() => toast.info('تعديل الملف')}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                {/* تحميل */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-green-500"
                                  onClick={() => toast.info('جاري التحميل...')}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                {/* إخفاء/إظهار */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 ${file.is_hidden ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground hover:text-amber-500'}`}
                                  onClick={() => toast.info(file.is_hidden ? 'إظهار' : 'إخفاء')}
                                >
                                  {file.is_hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                {/* عرض (Play) */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  onClick={() => setLocation(`/viewer/${file.id}`)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* تبويب الطلاب */}
      {activeTab === "students" && (
        <div className="space-y-3">
          {/* شريط البحث */}
          <Card>
            <CardContent className="p-3 lg:p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث عن طالب..."
                    className="pr-10 h-9 text-sm"
                  />
                </div>
                <Select>
                  <SelectTrigger className="h-9 w-32 lg:w-40 text-sm">
                    <SelectValue placeholder="التخصص" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التخصصات</SelectItem>
                    {course.majors.map((major) => (
                      <SelectItem key={major.id} value={String(major.id)}>
                        {major.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">إجمالي الطلاب</span>
                </div>
                <p className="text-xl font-bold mt-1">{courseStudents.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">نشط</span>
                </div>
                <p className="text-xl font-bold mt-1">
                  {courseStudents.filter((s) => s.status === "active").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">التحميلات</span>
                </div>
                <p className="text-xl font-bold mt-1">
                  {courseFiles.reduce((sum, f) => sum + f.download_count, 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">الملفات</span>
                </div>
                <p className="text-xl font-bold mt-1">{courseFiles.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* قائمة الطلاب */}
          <Card>
            <CardContent className="p-0">
              {/* موبايل */}
              <div className="lg:hidden divide-y">
                {courseStudents.map((student) => (
                  <div key={student.id} className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{student.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{student.academic_id}</span>
                        <span>•</span>
                        <span>{student.level?.name}</span>
                      </div>
                    </div>
                    <Badge className={student.status === "active" ? "badge-success" : "badge-warning"}>
                      {student.status === "active" ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right p-4 font-medium">الطالب</th>
                      <th className="text-right p-4 font-medium">الرقم الأكاديمي</th>
                      <th className="text-right p-4 font-medium">التخصص</th>
                      <th className="text-right p-4 font-medium">المستوى</th>
                      <th className="text-right p-4 font-medium">الحالة</th>
                      <th className="text-right p-4 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseStudents.map((student) => (
                      <tr key={student.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{student.full_name}</p>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">{student.academic_id}</td>
                        <td className="p-4">{student.major?.name || "-"}</td>
                        <td className="p-4">{student.level?.name || "-"}</td>
                        <td className="p-4">
                          <Badge className={student.status === "active" ? "badge-success" : "badge-warning"}>
                            {student.status === "active" ? "نشط" : "غير نشط"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Mail className="h-4 w-4" />
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
        </div>
      )}

      {/* تبويب الإحصائيات */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          {/* إحصائيات عامة */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">الملفات</span>
                </div>
                <p className="text-2xl font-bold">{courseFiles.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fileTypes.map((t) => {
                    const count = courseFiles.filter((f) => f.file_type === t.code).length;
                    return count > 0 ? `${count} ${t.name}` : null;
                  }).filter(Boolean).join(" • ")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">التحميلات</span>
                </div>
                <p className="text-2xl font-bold">
                  {courseFiles.reduce((sum, f) => sum + f.download_count, 0)}
                </p>
                <p className="text-xs text-green-500 mt-1">+12% من الأسبوع الماضي</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">الطلاب</span>
                </div>
                <p className="text-2xl font-bold">{courseStudents.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {courseStudents.filter((s) => s.status === "active").length} نشط
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <span className="text-sm text-muted-foreground">معدل التفاعل</span>
                </div>
                <p className="text-2xl font-bold">78%</p>
                <Progress value={78} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* أكثر الملفات تحميلاً */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">أكثر الملفات تحميلاً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {courseFiles
                  .sort((a, b) => b.download_count - a.download_count)
                  .slice(0, 5)
                  .map((file, index) => {
                    const maxDownloads = Math.max(...courseFiles.map((f) => f.download_count));
                    const percentage = (file.download_count / maxDownloads) * 100;
                    return (
                      <div key={file.id} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{file.title}</p>
                          <Progress value={percentage} className="h-1.5 mt-1" />
                        </div>
                        <span className="text-sm font-medium">{file.download_count}</span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* تبويب الإعدادات */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">معلومات المقرر</CardTitle>
              <CardDescription>تعديل البيانات الأساسية للمقرر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رمز المقرر</Label>
                  <Input defaultValue={course.code} />
                </div>
                <div className="space-y-2">
                  <Label>اسم المقرر</Label>
                  <Input defaultValue={course.name} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea defaultValue={course.description} rows={3} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>المستوى</Label>
                  <Select defaultValue={String(course.level.id)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
                        <SelectItem key={level} value={String(level)}>
                          المستوى {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الساعات المعتمدة</Label>
                  <Input type="number" defaultValue={course.credit_hours} />
                </div>
                <div className="space-y-2">
                  <Label>الفصل الدراسي</Label>
                  <Select defaultValue={String(course.semester.id)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">الفصل الأول</SelectItem>
                      <SelectItem value="2">الفصل الثاني</SelectItem>
                      <SelectItem value="3">الفصل الصيفي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">إلغاء</Button>
                <Button onClick={() => toast.success("تم حفظ التغييرات")}>
                  حفظ التغييرات
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* المدرسين */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">المدرسين</CardTitle>
              <CardDescription>المدرسين المعينين على هذا المقرر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {course.instructors.map((instructor) => (
                  <div key={instructor.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{instructor.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مدرس
              </Button>
            </CardContent>
          </Card>

          {/* التخصصات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">التخصصات</CardTitle>
              <CardDescription>التخصصات المرتبطة بهذا المقرر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {course.majors.map((major) => (
                  <Badge key={major.id} variant="secondary" className="px-3 py-1">
                    {major.name}
                    <button className="mr-2 hover:text-destructive">×</button>
                  </Badge>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3">
                <Plus className="h-4 w-4 ml-2" />
                ربط تخصص
              </Button>
            </CardContent>
          </Card>

          {/* منطقة الخطر */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base text-destructive">منطقة الخطر</CardTitle>
              <CardDescription>إجراءات لا يمكن التراجع عنها</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => toast.error("تم حذف المقرر")}>
                <Trash2 className="h-4 w-4 ml-2" />
                حذف المقرر نهائياً
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default function CourseDetails() {
  return (
    <DashboardLayout title="تفاصيل المقرر" subtitle="إدارة الملفات والطلاب">
      <CourseDetailsContent />
    </DashboardLayout>
  );
}
