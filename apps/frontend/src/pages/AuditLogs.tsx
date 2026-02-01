/**
 * صفحة سجلات التدقيق
 * S-ACM Frontend - متصلة بـ Backend API
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auditLogsApi } from "@/lib/api";
import {
  Download,
  User,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Settings,
  Shield,
  MoreVertical,
  Clock,
  Monitor,
  Loader2,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "login":
      return LogIn;
    case "logout":
      return LogOut;
    case "create":
      return Plus;
    case "update":
      return Pencil;
    case "delete":
      return Trash2;
    case "upload":
      return Upload;
    case "settings":
      return Settings;
    case "restore":
      return RotateCcw;
    default:
      return Shield;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "login":
      return "bg-green-500/10 text-green-500";
    case "logout":
      return "bg-blue-500/10 text-blue-500";
    case "create":
      return "bg-green-500/10 text-green-500";
    case "update":
      return "bg-yellow-500/10 text-yellow-500";
    case "delete":
    case "permanent_delete":
      return "bg-red-500/10 text-red-500";
    case "restore":
      return "bg-purple-500/10 text-purple-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

const actionLabels: Record<string, string> = {
  login: "تسجيل دخول",
  logout: "تسجيل خروج",
  create: "إنشاء",
  update: "تحديث",
  delete: "حذف",
  upload: "رفع ملف",
  settings: "تعديل إعدادات",
  restore: "استعادة",
  permanent_delete: "حذف نهائي",
  empty_trash: "تفريغ المحذوفات",
};

const entityLabels: Record<string, string> = {
  user: "مستخدم",
  role: "دور",
  course: "مقرر",
  file: "ملف",
  department: "قسم",
  major: "تخصص",
  level: "مستوى",
  notification: "إشعار",
  settings: "إعدادات",
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogsApi.getAll({ page, limit: 20 });
      if (res.success && res.data) {
        setLogs(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error("فشل في جلب السجلات");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const viewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const exportLogs = () => {
    toast.info("جاري تصدير السجلات...");
    // يمكن إضافة منطق التصدير هنا
  };

  if (loading && logs.length === 0) {
    return (
      <DashboardLayout title="سجلات التدقيق" subtitle="تتبع جميع العمليات في النظام">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="سجلات التدقيق" subtitle="تتبع جميع العمليات في النظام">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
        <Button variant="outline" size="sm" onClick={exportLogs}>
          <Download className="h-4 w-4 ml-2" />
          تصدير
        </Button>
      </div>

      {/* السجلات */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد سجلات</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => {
            const ActionIcon = getActionIcon(log.action);
            return (
              <Card key={log.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                        <ActionIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {actionLabels[log.action] || log.action}
                          </h3>
                          {log.entityType && (
                            <Badge variant="outline" className="text-xs">
                              {entityLabels[log.entityType] || log.entityType}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{log.userName || log.userEmail || "غير معروف"}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(log.createdAt)}</span>
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
                        <DropdownMenuItem onClick={() => viewDetails(log)}>
                          <Monitor className="h-4 w-4 ml-2" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            صفحة {page} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog التفاصيل */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل السجل</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">العملية</p>
                  <p className="font-medium">{actionLabels[selectedLog.action] || selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">نوع الكيان</p>
                  <p className="font-medium">{entityLabels[selectedLog.entityType || ""] || selectedLog.entityType || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">المستخدم</p>
                  <p className="font-medium">{selectedLog.userName || selectedLog.userEmail || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">التاريخ</p>
                  <p className="font-medium">{formatDate(selectedLog.createdAt)}</p>
                </div>
                {selectedLog.ipAddress && (
                  <div>
                    <p className="text-muted-foreground">عنوان IP</p>
                    <p className="font-medium font-mono text-xs">{selectedLog.ipAddress}</p>
                  </div>
                )}
                {selectedLog.entityId && (
                  <div>
                    <p className="text-muted-foreground">معرف الكيان</p>
                    <p className="font-medium font-mono text-xs truncate">{selectedLog.entityId}</p>
                  </div>
                )}
              </div>
              
              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div className="space-y-2">
                  {selectedLog.oldValue && (
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">القيمة السابقة</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(selectedLog.oldValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.newValue && (
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">القيمة الجديدة</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(selectedLog.newValue, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
