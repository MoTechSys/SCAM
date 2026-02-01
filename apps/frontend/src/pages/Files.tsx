/**
 * صفحة إدارة الملفات
 * S-ACM Frontend - متصلة بـ Backend API مع دعم Supabase Storage
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { filesApi, coursesApi } from "@/lib/api";
import {
  List,
  Upload,
  Search,
  Eye,
  Pencil,
  Trash2,
  Download,
  FileText,
  FileCheck,
  ClipboardList,
  File,
  Play,
  Loader2,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";

const pageTabs: Tab[] = [];

interface FileData {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  courseId?: string;
  courseName?: string;
  courseCode?: string;
  uploaderId?: string;
  uploaderName?: string;
  category: string;
  downloads: number;
  createdAt: string;
}

const categoryOptions = [
  { value: "lecture", label: "محاضرة" },
  { value: "assignment", label: "واجب" },
  { value: "exam", label: "اختبار" },
  { value: "resource", label: "مصدر" },
  { value: "other", label: "أخرى" },
];

const getFileIcon = (category: string) => {
  switch (category) {
    case "lecture":
      return FileText;
    case "assignment":
      return FileCheck;
    case "exam":
      return ClipboardList;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getCategoryLabel = (value: string) => {
  return categoryOptions.find(c => c.value === value)?.label || value;
};

function FilesContent() {
  const [, navigate] = useLocation();
  const { setTabs, setActiveTab } = useTabs();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [files, setFiles] = useState<FileData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    courseId: "",
    category: "other",
    description: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Delete dialog
  const [deleteFile, setDeleteFile] = useState<FileData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    setTabs(pageTabs);
    setActiveTab("list");
  }, [setTabs, setActiveTab]);

  // جلب البيانات
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await filesApi.getAll();
      if (response.success && response.data) {
        setFiles(response.data.data || response.data || []);
      }
    } catch (error) {
      toast.error("فشل في جلب الملفات");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll();
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchCourses();
  }, [fetchFiles]);

  // Filter files locally
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "all" || file.courseId === courseFilter;
    const matchesCategory = categoryFilter === "all" || file.category === categoryFilter;
    return matchesSearch && matchesCourse && matchesCategory;
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("حجم الملف يتجاوز الحد المسموح (50MB)");
        return;
      }
      setSelectedFile(file);
      setUploadForm(prev => ({
        ...prev,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      }));
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("الرجاء اختيار ملف");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await filesApi.upload(selectedFile, {
        name: uploadForm.name || selectedFile.name,
        courseId: uploadForm.courseId === 'none' ? undefined : (uploadForm.courseId || undefined),
        category: uploadForm.category,
        description: uploadForm.description || undefined,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        toast.success("تم رفع الملف بنجاح");
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadForm({ name: "", courseId: "", category: "other", description: "" });
        fetchFiles();
      } else {
        toast.error(response.error || "فشل في رفع الملف");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع الملف");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // حذف ملف
  const handleDeleteFile = async () => {
    if (!deleteFile) return;

    setFormLoading(true);
    try {
      const response = await filesApi.delete(deleteFile.id);

      if (response.success) {
        toast.success("تم حذف الملف بنجاح");
        setDeleteDialogOpen(false);
        setDeleteFile(null);
        fetchFiles();
      } else {
        toast.error(response.error || "فشل في حذف الملف");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setFormLoading(false);
    }
  };

  // تحميل ملف
  const handleDownload = async (file: FileData) => {
    try {
      // Record download
      await filesApi.download(file.id);
      
      // Open file URL
      window.open(file.url, '_blank');
      toast.success("جاري تحميل الملف");
    } catch (error) {
      // Still open the file even if recording fails
      window.open(file.url, '_blank');
    }
  };

  // فلاتر الموبايل
  const mobileCategoryFilters = [
    { id: "all", label: "الكل", active: categoryFilter === "all" },
    ...categoryOptions.map(cat => ({
      id: cat.value,
      label: cat.label,
      active: categoryFilter === cat.value,
    })),
  ];

  // عناصر القائمة للموبايل
  const mobileFileItems = filteredFiles.map((file) => {
    const Icon = getFileIcon(file.category);
    return {
      id: file.id,
      title: file.name,
      subtitle: `${file.courseCode || "-"} • ${getCategoryLabel(file.category)}`,
      icon: <Icon className="h-4 w-4 text-primary" />,
      actions: [
        { label: "تحميل", icon: <Download className="h-4 w-4" />, onClick: () => handleDownload(file) },
        { label: "حذف", icon: <Trash2 className="h-4 w-4" />, onClick: () => { setDeleteFile(file); setDeleteDialogOpen(true); }, variant: "destructive" as const },
      ],
    };
  });

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث بعنوان الملف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full md:w-56">
                    <SelectValue placeholder="المقرر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المقررات</SelectItem>
                    {courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchFiles}>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تحديث
                </Button>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 ml-2" />
                  رفع ملف
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  key: "icon",
                  header: "",
                  className: "w-12",
                  render: (file: FileData) => {
                    const Icon = getFileIcon(file.category);
                    return (
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    );
                  },
                },
                {
                  key: "name",
                  header: "العنوان",
                  render: (file: FileData) => (
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.courseCode ? `${file.courseCode} - ${file.courseName}` : "-"}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "category",
                  header: "التصنيف",
                  render: (file: FileData) => (
                    <Badge variant="outline">
                      {getCategoryLabel(file.category)}
                    </Badge>
                  ),
                },
                {
                  key: "size",
                  header: "الحجم",
                  render: (file: FileData) => (
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  ),
                },
                {
                  key: "downloads",
                  header: "التحميلات",
                  render: (file: FileData) => (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Download className="h-4 w-4" />
                      <span>{file.downloads}</span>
                    </div>
                  ),
                },
                {
                  key: "uploader",
                  header: "رفع بواسطة",
                  render: (file: FileData) => (
                    <span className="text-sm text-muted-foreground">
                      {file.uploaderName || "-"}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "الإجراءات",
                  render: (file: FileData) => (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleDownload(file)}
                        title="تحميل"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => { setDeleteFile(file); setDeleteDialogOpen(true); }}
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={filteredFiles}
              keyExtractor={(file) => file.id}
              emptyMessage="لا توجد ملفات"
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
              }}
            />
          )}

          {filteredFiles.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">لا توجد ملفات</p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 ml-2" />
                  رفع ملف جديد
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-4">
        <div className="flex gap-2">
          <MobileSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="بحث عن ملف..."
          />
          <Button onClick={() => setUploadDialogOpen(true)} size="icon">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        <MobileFilters
          filters={mobileCategoryFilters}
          onFilterChange={(id) => setCategoryFilter(id)}
        />
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <MobileList items={mobileFileItems} />
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>رفع ملف جديد</DialogTitle>
            <DialogDescription>
              اختر ملفاً لرفعه إلى النظام (الحد الأقصى 50MB)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Input */}
            <div className="space-y-2">
              <Label>الملف</Label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="*/*"
              />
              {selectedFile ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                  <File className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-24 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span>اضغط لاختيار ملف</span>
                  </div>
                </Button>
              )}
            </div>

            {/* File Name */}
            <div className="space-y-2">
              <Label htmlFor="fileName">اسم الملف</Label>
              <Input
                id="fileName"
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم الملف"
              />
            </div>

            {/* Course */}
            <div className="space-y-2">
              <Label>المقرر (اختياري)</Label>
              <Select
                value={uploadForm.courseId}
                onValueChange={(value) => setUploadForm(prev => ({ ...prev, courseId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المقرر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون مقرر</SelectItem>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Textarea
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="أدخل وصفاً للملف"
                rows={3}
              />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>جاري الرفع...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
              إلغاء
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 ml-2" />
                  رفع
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الملف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الملف "{deleteFile?.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteFile} disabled={formLoading}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Files() {
  return (
    <DashboardLayout title="إدارة الملفات">
      <FilesContent />
    </DashboardLayout>
  );
}
