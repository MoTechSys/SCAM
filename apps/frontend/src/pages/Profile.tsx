/**
 * صفحة البروفايل والإعدادات الشخصية
 * S-ACM Frontend - متصلة بـ Backend API
 */

import { useState, useEffect } from "react";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import {
  User,
  Lock,
  Bell,
  Palette,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const pageTabs: Tab[] = [
  { id: "info", label: "المعلومات الشخصية", icon: User },
  { id: "password", label: "كلمة المرور", icon: Lock },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "appearance", label: "المظهر", icon: Palette },
];

function ProfileContent() {
  const { activeTab, setTabs, setActiveTab } = useTabs();
  const { user } = useAuth();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // بيانات كلمة المرور
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // إعدادات الإشعارات
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newFileNotification: true,
    newUserNotification: true,
    systemUpdates: false,
    weeklyReport: true,
  });

  // إعدادات المظهر
  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: true,
    compactMode: false,
    animationsEnabled: true,
    fontSize: "medium",
  });

  useEffect(() => {
    setTabs(pageTabs);
    if (!activeTab) setActiveTab("info");
  }, [setTabs, setActiveTab]);

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    
    setChangingPassword(true);
    try {
      const res = await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (res.success) {
        toast.success("تم تغيير كلمة المرور بنجاح");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res.error || "فشل في تغيير كلمة المرور");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setChangingPassword(false);
    }
  };

  const saveNotificationSettings = () => {
    toast.success("تم حفظ إعدادات الإشعارات");
  };

  const saveAppearanceSettings = () => {
    toast.success("تم حفظ إعدادات المظهر");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* المعلومات الشخصية */}
      {activeTab === "info" && (
        <div className="space-y-4">
          {/* بطاقة المستخدم */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {user?.fullName ? getInitials(user.fullName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-right flex-1">
                  <h2 className="text-xl font-bold">{user?.fullName || "مستخدم"}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 ml-1" />
                      {user?.roleName || "مستخدم"}
                    </Badge>
                    {user?.isActive && (
                      <Badge className="bg-green-500/10 text-green-500">
                        <CheckCircle className="h-3 w-3 ml-1" />
                        نشط
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معلومات الحساب */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات الحساب</CardTitle>
              <CardDescription>معلومات حسابك الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    الاسم الكامل
                  </Label>
                  <Input value={user?.fullName || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    رقم الهاتف
                  </Label>
                  <Input value={user?.phone || "غير محدد"} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    الدور
                  </Label>
                  <Input value={user?.roleName || "غير محدد"} disabled />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                لتعديل معلوماتك الشخصية، يرجى التواصل مع مدير النظام.
              </p>
            </CardContent>
          </Card>

          {/* الصلاحيات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الصلاحيات</CardTitle>
              <CardDescription>صلاحياتك في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user?.permissions?.slice(0, 10).map((permission, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
                {user?.permissions && user.permissions.length > 10 && (
                  <Badge variant="secondary" className="text-xs">
                    +{user.permissions.length - 10} أخرى
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* تغيير كلمة المرور */}
      {activeTab === "password" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تغيير كلمة المرور</CardTitle>
            <CardDescription>قم بتحديث كلمة المرور الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="أدخل كلمة المرور الحالية"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="أدخل كلمة المرور الجديدة"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full">
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري التغيير...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  تغيير كلمة المرور
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* إعدادات الإشعارات */}
      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">إعدادات الإشعارات</CardTitle>
            <CardDescription>تحكم في طريقة استلام الإشعارات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إشعارات البريد الإلكتروني</p>
                <p className="text-sm text-muted-foreground">استلام الإشعارات عبر البريد</p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إشعارات الملفات الجديدة</p>
                <p className="text-sm text-muted-foreground">عند رفع ملف جديد في مقرراتك</p>
              </div>
              <Switch
                checked={notificationSettings.newFileNotification}
                onCheckedChange={(checked) =>
                  setNotificationSettings({ ...notificationSettings, newFileNotification: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تحديثات النظام</p>
                <p className="text-sm text-muted-foreground">إشعارات حول تحديثات النظام</p>
              </div>
              <Switch
                checked={notificationSettings.systemUpdates}
                onCheckedChange={(checked) =>
                  setNotificationSettings({ ...notificationSettings, systemUpdates: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">التقرير الأسبوعي</p>
                <p className="text-sm text-muted-foreground">ملخص أسبوعي للنشاط</p>
              </div>
              <Switch
                checked={notificationSettings.weeklyReport}
                onCheckedChange={(checked) =>
                  setNotificationSettings({ ...notificationSettings, weeklyReport: checked })
                }
              />
            </div>
            
            <Button onClick={saveNotificationSettings} className="w-full">
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </CardContent>
        </Card>
      )}

      {/* إعدادات المظهر */}
      {activeTab === "appearance" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">إعدادات المظهر</CardTitle>
            <CardDescription>تخصيص مظهر التطبيق</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">الوضع الداكن</p>
                <p className="text-sm text-muted-foreground">تفعيل المظهر الداكن</p>
              </div>
              <Switch
                checked={appearanceSettings.darkMode}
                onCheckedChange={(checked) =>
                  setAppearanceSettings({ ...appearanceSettings, darkMode: checked })
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">الوضع المضغوط</p>
                <p className="text-sm text-muted-foreground">تقليل المسافات بين العناصر</p>
              </div>
              <Switch
                checked={appearanceSettings.compactMode}
                onCheckedChange={(checked) =>
                  setAppearanceSettings({ ...appearanceSettings, compactMode: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">الحركات</p>
                <p className="text-sm text-muted-foreground">تفعيل الحركات والانتقالات</p>
              </div>
              <Switch
                checked={appearanceSettings.animationsEnabled}
                onCheckedChange={(checked) =>
                  setAppearanceSettings({ ...appearanceSettings, animationsEnabled: checked })
                }
              />
            </div>
            
            <Button onClick={saveAppearanceSettings} className="w-full">
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default function Profile() {
  return (
    <DashboardLayout title="الملف الشخصي" subtitle="إدارة حسابك وإعداداتك">
      <ProfileContent />
    </DashboardLayout>
  );
}
