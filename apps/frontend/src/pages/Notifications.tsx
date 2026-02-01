/**
 * صفحة الإشعارات
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
import { notificationsApi } from "@/lib/api";
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
  Send,
  Inbox,
  CheckCheck,
  Trash2,
  Eye,
  AlertCircle,
  Info,
  AlertTriangle,
  Bell,
  MoreVertical,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
  };
}

const pageTabs: Tab[] = [
  { id: "inbox", label: "صندوق الوارد", icon: Inbox },
  { id: "send", label: "إرسال إشعار", icon: Send },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "urgent":
    case "error":
      return AlertCircle;
    case "warning":
      return AlertTriangle;
    default:
      return Info;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "urgent":
    case "error":
      return "text-red-500 bg-red-500/10";
    case "warning":
      return "text-amber-500 bg-amber-500/10";
    case "success":
      return "text-green-500 bg-green-500/10";
    default:
      return "text-blue-500 bg-blue-500/10";
  }
};

function NotificationsContent() {
  const { activeTab, setTabs, setActiveTab } = useTabs();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  // Send form state
  const [sendForm, setSendForm] = useState({
    title: "",
    message: "",
    type: "info",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const tabs = [
      { id: "inbox", label: "صندوق الوارد", icon: Inbox, badge: unreadCount > 0 ? unreadCount : undefined },
      { id: "send", label: "إرسال إشعار", icon: Send },
    ];
    setTabs(tabs);
    if (!activeTab) setActiveTab("inbox");
  }, [unreadCount]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getAll();
      if (res.success) {
        const data = res.data || [];
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      toast.error("فشل في جلب الإشعارات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await notificationsApi.markAsRead(id);
      if (res.success) {
        fetchNotifications();
      }
    } catch (error) {
      toast.error("فشل في تحديث الإشعار");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await notificationsApi.markAllAsRead();
      if (res.success) {
        toast.success("تم تحديد جميع الإشعارات كمقروءة");
        fetchNotifications();
      }
    } catch (error) {
      toast.error("فشل في تحديث الإشعارات");
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;
    try {
      const res = await notificationsApi.delete(selectedNotification.id);
      if (res.success) {
        toast.success("تم حذف الإشعار");
        fetchNotifications();
      } else {
        toast.error(res.error || "فشل في حذف الإشعار");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    }
    setDeleteDialogOpen(false);
    setSelectedNotification(null);
  };

  const handleSend = async () => {
    if (!sendForm.title || !sendForm.message) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    setSending(true);
    try {
      const res = await notificationsApi.send({
        title: sendForm.title,
        message: sendForm.message,
        type: sendForm.type,
      });
      if (res.success) {
        toast.success("تم إرسال الإشعار بنجاح");
        setSendForm({ title: "", message: "", type: "info" });
        setActiveTab("inbox");
        fetchNotifications();
      } else {
        toast.error(res.error || "فشل في إرسال الإشعار");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setSending(false);
    }
  };

  const viewNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setViewDialogOpen(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const confirmDelete = (notification: Notification) => {
    setSelectedNotification(notification);
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

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* صندوق الوارد */}
      {activeTab === "inbox" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={fetchNotifications}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 ml-2" />
                تحديد الكل كمقروء
              </Button>
            )}
          </div>

          {/* الإشعارات */}
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد إشعارات</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const TypeIcon = getTypeIcon(notification.type);
                return (
                  <Card 
                    key={notification.id} 
                    className={`card-hover cursor-pointer ${!notification.isRead ? 'border-primary/50 bg-primary/5' : ''}`}
                    onClick={() => viewNotification(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">{notification.title}</h3>
                              {!notification.isRead && (
                                <Badge className="bg-primary text-primary-foreground text-xs">جديد</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); viewNotification(notification); }}>
                              <Eye className="h-4 w-4 ml-2" />
                              عرض
                            </DropdownMenuItem>
                            {!notification.isRead && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}>
                                <CheckCheck className="h-4 w-4 ml-2" />
                                تحديد كمقروء
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); confirmDelete(notification); }}
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
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* إرسال إشعار */}
      {activeTab === "send" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>عنوان الإشعار *</Label>
              <Input
                value={sendForm.title}
                onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                placeholder="أدخل عنوان الإشعار"
              />
            </div>
            
            <div className="space-y-2">
              <Label>نوع الإشعار</Label>
              <Select
                value={sendForm.type}
                onValueChange={(value) => setSendForm({ ...sendForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">معلومات</SelectItem>
                  <SelectItem value="success">نجاح</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="error">خطأ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>نص الإشعار *</Label>
              <Textarea
                value={sendForm.message}
                onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                placeholder="أدخل نص الإشعار..."
                rows={5}
              />
            </div>
            
            <Button onClick={handleSend} disabled={sending} className="w-full">
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  إرسال الإشعار
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog عرض الإشعار */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
            <DialogDescription>
              {selectedNotification && formatDate(selectedNotification.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm whitespace-pre-wrap">{selectedNotification?.message}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              إغلاق
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
              هل أنت متأكد من حذف هذا الإشعار؟
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

export default function Notifications() {
  return (
    <DashboardLayout title="الإشعارات" subtitle="إدارة وإرسال الإشعارات">
      <NotificationsContent />
    </DashboardLayout>
  );
}
