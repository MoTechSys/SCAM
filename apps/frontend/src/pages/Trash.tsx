/**
 * صفحة سلة المحذوفات
 * S-ACM Frontend - متصلة بـ Backend API
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trashApi } from "@/lib/api";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Trash2,
  Users,
  FileText,
  BookOpen,
  Shield,
  RotateCcw,
  Clock,
  MoreVertical,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface TrashCounts {
  users: number;
  roles: number;
  courses: number;
  files: number;
  total: number;
}

interface TrashData {
  users: any[];
  roles: any[];
  courses: any[];
  files: any[];
}

function TrashContent() {
  const { activeTab, setTabs, setActiveTab } = useTabs();
  
  const [data, setData] = useState<TrashData>({ users: [], roles: [], courses: [], files: [] });
  const [counts, setCounts] = useState<TrashCounts>({ users: 0, roles: 0, courses: 0, files: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emptyDialogOpen, setEmptyDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const pageTabs: Tab[] = [
    { id: "users", label: "المستخدمين", icon: Users, badge: counts.users },
    { id: "roles", label: "الأدوار", icon: Shield, badge: counts.roles },
    { id: "courses", label: "المقررات", icon: BookOpen, badge: counts.courses },
    { id: "files", label: "الملفات", icon: FileText, badge: counts.files },
  ];

  useEffect(() => {
    setTabs(pageTabs);
    if (!activeTab) setActiveTab("users");
  }, [counts]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await trashApi.getAll();
      if (res.success) {
        setData(res.data || { users: [], roles: [], courses: [], files: [] });
        setCounts(res.counts || { users: 0, roles: 0, courses: 0, files: 0, total: 0 });
      }
    } catch (error) {
      toast.error("فشل في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRestore = async () => {
    if (!selectedItem) return;
    try {
      const res = await trashApi.restore(selectedItem.type, selectedItem.id);
      if (res.success) {
        toast.success("تم استعادة العنصر بنجاح");
        fetchData();
      } else {
        toast.error(res.error || "فشل في استعادة العنصر");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    }
    setRestoreDialogOpen(false);
    setSelectedItem(null);
  };

  const handlePermanentDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await trashApi.permanentDelete(selectedItem.type, selectedItem.id);
      if (res.success) {
        toast.success("تم الحذف النهائي بنجاح");
        fetchData();
      } else {
        toast.error(res.error || "فشل في الحذف");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    }
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleEmptyTrash = async () => {
    try {
      const res = await trashApi.empty();
      if (res.success) {
        toast.success("تم تفريغ سلة المحذوفات");
        fetchData();
      } else {
        toast.error(res.error || "فشل في تفريغ السلة");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    }
    setEmptyDialogOpen(false);
  };

  const confirmRestore = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setRestoreDialogOpen(true);
  };

  const confirmDelete = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setDeleteDialogOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const renderItem = (item: any, type: string, icon: React.ReactNode, title: string, subtitle: string) => (
    <Card key={item.id} className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              {icon}
            </div>
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>حُذف في: {formatDate(item.deletedAt)}</span>
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
              <DropdownMenuItem onClick={() => confirmRestore(item, type)}>
                <RotateCcw className="h-4 w-4 ml-2" />
                استعادة
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => confirmDelete(item, type)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف نهائي
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (message: string) => (
    <Card>
      <CardContent className="p-8 text-center text-muted-foreground">
        <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{message}</p>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Badge variant="outline">
            {counts.total} عنصر محذوف
          </Badge>
        </div>
        {counts.total > 0 && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setEmptyDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            تفريغ السلة
          </Button>
        )}
      </div>

      {/* المستخدمين */}
      {activeTab === "users" && (
        <div className="space-y-3">
          {data.users.length === 0 ? (
            renderEmptyState("لا يوجد مستخدمين محذوفين")
          ) : (
            data.users.map((user) => renderItem(
              user,
              "user",
              <Users className="h-5 w-5 text-destructive" />,
              user.fullName,
              user.email
            ))
          )}
        </div>
      )}

      {/* الأدوار */}
      {activeTab === "roles" && (
        <div className="space-y-3">
          {data.roles.length === 0 ? (
            renderEmptyState("لا يوجد أدوار محذوفة")
          ) : (
            data.roles.map((role) => renderItem(
              role,
              "role",
              <Shield className="h-5 w-5 text-destructive" />,
              role.name,
              role.description || "لا يوجد وصف"
            ))
          )}
        </div>
      )}

      {/* المقررات */}
      {activeTab === "courses" && (
        <div className="space-y-3">
          {data.courses.length === 0 ? (
            renderEmptyState("لا يوجد مقررات محذوفة")
          ) : (
            data.courses.map((course) => renderItem(
              course,
              "course",
              <BookOpen className="h-5 w-5 text-destructive" />,
              course.name,
              course.code
            ))
          )}
        </div>
      )}

      {/* الملفات */}
      {activeTab === "files" && (
        <div className="space-y-3">
          {data.files.length === 0 ? (
            renderEmptyState("لا يوجد ملفات محذوفة")
          ) : (
            data.files.map((file) => renderItem(
              file,
              "file",
              <FileText className="h-5 w-5 text-destructive" />,
              file.name,
              file.course?.name || "غير محدد"
            ))
          )}
        </div>
      )}

      {/* Dialog استعادة */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الاستعادة</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد استعادة هذا العنصر؟ سيتم إعادته إلى مكانه الأصلي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              <RotateCcw className="h-4 w-4 ml-2" />
              استعادة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog حذف نهائي */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              تأكيد الحذف النهائي
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من الحذف النهائي؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف البيانات بشكل دائم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog تفريغ السلة */}
      <AlertDialog open={emptyDialogOpen} onOpenChange={setEmptyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              تفريغ سلة المحذوفات
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من تفريغ سلة المحذوفات بالكامل؟ سيتم حذف {counts.total} عنصر بشكل نهائي ولا يمكن استعادتها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEmptyTrash}
              className="bg-destructive text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              تفريغ السلة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function Trash() {
  return (
    <DashboardLayout title="سلة المحذوفات" subtitle="استعادة أو حذف العناصر نهائياً">
      <TrashContent />
    </DashboardLayout>
  );
}
