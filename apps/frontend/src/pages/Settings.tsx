/**
 * صفحة الإعدادات
 * S-ACM Frontend - Mobile App-Like Experience
 */

import { useState, useEffect } from "react";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MobileCard, MobileList } from "@/components/ui/mobile-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Bot,
  Mail,
  Shield,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  ChevronLeft,
  Globe,
  Clock,
  UserPlus,
  Key,
  Zap,
  Server,
  Lock,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

const pageTabs: Tab[] = [
  { id: "general", label: "عام", icon: SettingsIcon },
  { id: "ai", label: "الذكاء الاصطناعي", icon: Bot },
  { id: "email", label: "البريد الإلكتروني", icon: Mail },
  { id: "security", label: "الأمان", icon: Shield },
];

const aiModels = [
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
];

// مكون الإعداد المصغر للموبايل
function MobileSettingItem({ icon: Icon, label, value, onClick }: { icon: any; label: string; value?: string; onClick?: () => void }) {
  return (
    <div 
      className="flex items-center gap-3 py-3 border-b border-border last:border-0"
      onClick={onClick}
    >
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {value && <p className="text-xs text-muted-foreground truncate">{value}</p>}
      </div>
      {onClick && <ChevronLeft className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
}

// مكون التبديل المصغر للموبايل
function MobileToggleItem({ label, description, defaultChecked }: { label: string; description?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0 ml-3">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function SettingsContent() {
  const { activeTab, setTabs, setActiveTab } = useTabs();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // تعيين التبويبات عند تحميل الصفحة
  useEffect(() => {
    setTabs(pageTabs);
    setActiveTab("general");
  }, [setTabs, setActiveTab]);

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* الإعدادات العامة */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات النظام</CardTitle>
                <CardDescription>الإعدادات الأساسية للنظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="system_name">اسم النظام</Label>
                    <Input
                      id="system_name"
                      defaultValue="S-ACM - نظام إدارة المحتوى الأكاديمي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="system_url">رابط النظام</Label>
                    <Input
                      id="system_url"
                      defaultValue="https://s-acm.example.com"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_email">بريد المدير</Label>
                    <Input
                      id="admin_email"
                      type="email"
                      defaultValue="admin@s-acm.com"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">المنطقة الزمنية</Label>
                    <Select defaultValue="asia_aden">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia_aden">آسيا/عدن (GMT+3)</SelectItem>
                        <SelectItem value="asia_riyadh">آسيا/الرياض (GMT+3)</SelectItem>
                        <SelectItem value="asia_dubai">آسيا/دبي (GMT+4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => toast.success("تم حفظ الإعدادات")}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إعدادات التسجيل</CardTitle>
                <CardDescription>التحكم في تسجيل المستخدمين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">السماح بالتسجيل الذاتي</p>
                    <p className="text-sm text-muted-foreground">
                      السماح للمستخدمين بتفعيل حساباتهم
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">التحقق بالبريد الإلكتروني</p>
                    <p className="text-sm text-muted-foreground">
                      إرسال رمز OTP للتحقق
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">وضع الصيانة</p>
                    <p className="text-sm text-muted-foreground">
                      تعطيل الوصول للنظام مؤقتاً
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* إعدادات الذكاء الاصطناعي */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات API</CardTitle>
                <CardDescription>تكوين مفاتيح API للذكاء الاصطناعي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ai_provider">مزود الخدمة</Label>
                  <Select defaultValue="google">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google (Gemini)</SelectItem>
                      <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai_model">النموذج</Label>
                  <Select defaultValue="gemini-2.0-flash">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_key">مفتاح API</Label>
                  <div className="relative">
                    <Input
                      id="api_key"
                      type={showApiKey ? "text" : "password"}
                      defaultValue="AIzaSyB..."
                      dir="ltr"
                      className="pl-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => toast.success("تم حفظ الإعدادات")}>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.success("الاتصال ناجح!")}
                  >
                    <RefreshCw className="h-4 w-4 ml-2" />
                    اختبار الاتصال
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>حدود الاستخدام</CardTitle>
                <CardDescription>تحديد معدل استخدام AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rate_limit">الحد الأقصى للطلبات/ساعة</Label>
                    <Input
                      id="rate_limit"
                      type="number"
                      defaultValue="10"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_tokens">الحد الأقصى للتوكنز</Label>
                    <Input
                      id="max_tokens"
                      type="number"
                      defaultValue="4096"
                      min="256"
                      max="32000"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تفعيل ميزات AI</p>
                    <p className="text-sm text-muted-foreground">
                      السماح للمستخدمين باستخدام AI
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* إعدادات البريد الإلكتروني */}
        {activeTab === "email" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إعدادات SMTP</CardTitle>
                    <CardDescription>تكوين خادم البريد الإلكتروني</CardDescription>
                  </div>
                  <Badge className="badge-success">
                    <CheckCircle className="h-3 w-3 ml-1" />
                    متصل
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_host">خادم SMTP</Label>
                    <Input
                      id="smtp_host"
                      defaultValue="smtp.gmail.com"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">المنفذ</Label>
                    <Input id="smtp_port" type="number" defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_from">البريد المرسل</Label>
                    <Input
                      id="email_from"
                      type="email"
                      defaultValue="noreply@s-acm.com"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_name">اسم المرسل</Label>
                    <Input id="email_name" defaultValue="S-ACM System" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_user">اسم المستخدم</Label>
                    <Input
                      id="email_user"
                      defaultValue="noreply@s-acm.com"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_password">كلمة مرور التطبيق</Label>
                    <div className="relative">
                      <Input
                        id="email_password"
                        type={showEmailPassword ? "text" : "password"}
                        defaultValue="xxxx xxxx xxxx xxxx"
                        dir="ltr"
                        className="pl-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-1 top-1/2 -translate-y-1/2"
                        onClick={() => setShowEmailPassword(!showEmailPassword)}
                      >
                        {showEmailPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">استخدام TLS</p>
                    <p className="text-sm text-muted-foreground">
                      تشفير الاتصال بالخادم
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => toast.success("تم حفظ الإعدادات")}>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.success("تم إرسال بريد تجريبي!")}
                  >
                    <Mail className="h-4 w-4 ml-2" />
                    إرسال بريد تجريبي
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>قوالب البريد</CardTitle>
                <CardDescription>تخصيص رسائل البريد الإلكتروني</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: "otp", name: "رمز التحقق OTP", status: "active" },
                    { id: "welcome", name: "رسالة الترحيب", status: "active" },
                    { id: "reset", name: "إعادة تعيين كلمة المرور", status: "active" },
                    { id: "notification", name: "إشعار جديد", status: "inactive" },
                  ].map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>{template.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            template.status === "active" ? "default" : "outline"
                          }
                        >
                          {template.status === "active" ? "مفعل" : "معطل"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info("تعديل القالب")}
                        >
                          تعديل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* إعدادات الأمان */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات كلمة المرور</CardTitle>
                <CardDescription>متطلبات كلمة المرور للمستخدمين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="min_length">الحد الأدنى للطول</Label>
                    <Input
                      id="min_length"
                      type="number"
                      defaultValue="8"
                      min="6"
                      max="32"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp_expiry">صلاحية OTP (دقائق)</Label>
                    <Input
                      id="otp_expiry"
                      type="number"
                      defaultValue="10"
                      min="5"
                      max="60"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">يتطلب أحرف كبيرة</p>
                    <p className="text-sm text-muted-foreground">
                      يجب أن تحتوي كلمة المرور على حرف كبير
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">يتطلب أرقام</p>
                    <p className="text-sm text-muted-foreground">
                      يجب أن تحتوي كلمة المرور على رقم
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">يتطلب رموز خاصة</p>
                    <p className="text-sm text-muted-foreground">
                      يجب أن تحتوي كلمة المرور على رمز خاص
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إعدادات الجلسة</CardTitle>
                <CardDescription>التحكم في جلسات المستخدمين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="session_timeout">
                      مهلة الجلسة (دقائق)
                    </Label>
                    <Input
                      id="session_timeout"
                      type="number"
                      defaultValue="60"
                      min="15"
                      max="1440"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_sessions">
                      الحد الأقصى للجلسات المتزامنة
                    </Label>
                    <Input
                      id="max_sessions"
                      type="number"
                      defaultValue="3"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تسجيل نشاط المستخدمين</p>
                    <p className="text-sm text-muted-foreground">
                      حفظ سجل تسجيل الدخول والخروج
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button onClick={() => toast.success("تم حفظ الإعدادات")}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        {/* الإعدادات العامة - موبايل */}
        {activeTab === "general" && (
          <>
            <MobileCard>
              <h3 className="font-semibold text-sm mb-3">معلومات النظام</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">اسم النظام</Label>
                  <Input defaultValue="S-ACM" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">رابط النظام</Label>
                  <Input defaultValue="https://s-acm.example.com" dir="ltr" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">بريد المدير</Label>
                  <Input defaultValue="admin@s-acm.com" dir="ltr" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">المنطقة الزمنية</Label>
                  <Select defaultValue="asia_aden">
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia_aden">آسيا/عدن</SelectItem>
                      <SelectItem value="asia_riyadh">آسيا/الرياض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </MobileCard>

            <MobileCard>
              <h3 className="font-semibold text-sm mb-3">إعدادات التسجيل</h3>
              <MobileToggleItem label="التسجيل الذاتي" description="السماح للمستخدمين بالتسجيل" defaultChecked />
              <MobileToggleItem label="التحقق بالبريد" description="إرسال OTP للتحقق" defaultChecked />
              <MobileToggleItem label="وضع الصيانة" description="تعطيل الوصول مؤقتاً" />
            </MobileCard>

            <Button className="w-full" onClick={() => toast.success("تم حفظ الإعدادات")}>
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </>
        )}

        {/* إعدادات AI - موبايل */}
        {activeTab === "ai" && (
          <>
            <MobileCard>
              <h3 className="font-semibold text-sm mb-3">إعدادات API</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">مزود الخدمة</Label>
                  <Select defaultValue="google">
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google (Gemini)</SelectItem>
                      <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">النموذج</Label>
                  <Select defaultValue="gemini-2.0-flash">
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels.slice(0, 3).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">مفتاح API</Label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      defaultValue="AIzaSyB..."
                      dir="ltr"
                      className="h-9 text-sm pl-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => toast.success("الاتصال ناجح!")}
              >
                <RefreshCw className="h-3 w-3 ml-2" />
                اختبار الاتصال
              </Button>
            </MobileCard>

            <MobileCard>
              <h3 className="font-semibold text-sm mb-3">حدود الاستخدام</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="space-y-1">
                  <Label className="text-xs">طلبات/ساعة</Label>
                  <Input type="number" defaultValue="10" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">الحد الأقصى توكنز</Label>
                  <Input type="number" defaultValue="4096" className="h-9 text-sm" />
                </div>
              </div>
              <MobileToggleItem label="تفعيل AI" description="السماح باستخدام AI" defaultChecked />
            </MobileCard>

            <Button className="w-full" onClick={() => toast.success("تم حفظ الإعدادات")}>
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </>
        )}

        {/* إعدادات البريد - موبايل */}
        {activeTab === "email" && (
          <>
            <MobileCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">إعدادات SMTP</h3>
                <Badge className="badge-success text-[10px]">
                  <CheckCircle className="h-3 w-3 ml-1" />
                  متصل
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">خادم SMTP</Label>
                    <Input defaultValue="smtp.gmail.com" dir="ltr" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">المنفذ</Label>
                    <Input type="number" defaultValue="587" className="h-9 text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">البريد المرسل</Label>
                  <Input defaultValue="noreply@s-acm.com" dir="ltr" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      type={showEmailPassword ? "text" : "password"}
                      defaultValue="xxxx xxxx"
                      dir="ltr"
                      className="h-9 text-sm pl-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                    >
                      {showEmailPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
              <MobileToggleItem label="استخدام TLS" description="تشفير الاتصال" defaultChecked />
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => toast.success("تم إرسال بريد تجريبي!")}
              >
                <Mail className="h-3 w-3 ml-2" />
                إرسال بريد تجريبي
              </Button>
            </MobileCard>

            <MobileCard>
              <h3 className="font-semibold text-sm mb-3">قوالب البريد</h3>
              <MobileList
                items={[
                  { id: "otp", title: "رمز التحقق OTP", badge: <Badge className="text-[10px]">مفعل</Badge>, icon: <Mail className="h-4 w-4 text-primary" /> },
                  { id: "welcome", title: "رسالة الترحيب", badge: <Badge className="text-[10px]">مفعل</Badge>, icon: <Mail className="h-4 w-4 text-primary" /> },
                  { id: "reset", title: "إعادة تعيين كلمة المرور", badge: <Badge className="text-[10px]">مفعل</Badge>, icon: <Mail className="h-4 w-4 text-primary" /> },
                  { id: "notification", title: "إشعار جديد", badge: <Badge variant="outline" className="text-[10px]">معطل</Badge>, icon: <Mail className="h-4 w-4 text-muted-foreground" /> },
                ]}
              />
            </MobileCard>

            <Button className="w-full" onClick={() => toast.success("تم حفظ الإعدادات")}>
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </>
        )}

        {/* إعدادات الأمان - موبايل */}
        {activeTab === "security" && (
          <>
            <MobileCard>
              <h3 className="font-semibold text-sm mb-3">إعدادات كلمة المرور</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="space-y-1">
                  <Label className="text-xs">الحد الأدنى للطول</Label>
                  <Input type="number" defaultValue="8" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">صلاحية OTP (دقائق)</Label>
                  <Input type="number" defaultValue="10" className="h-9 text-sm" />
                </div>
              </div>
              <MobileToggleItem label="أحرف كبيرة" description="يتطلب حرف كبير" defaultChecked />
              <MobileToggleItem label="أرقام" description="يتطلب رقم" defaultChecked />
              <MobileToggleItem label="رموز خاصة" description="يتطلب رمز خاص" />
            </MobileCard>

            <MobileCard>
              <h3 className="font-semibold text-sm mb-3">إعدادات الجلسة</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="space-y-1">
                  <Label className="text-xs">مهلة الجلسة (دقائق)</Label>
                  <Input type="number" defaultValue="60" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">الجلسات المتزامنة</Label>
                  <Input type="number" defaultValue="3" className="h-9 text-sm" />
                </div>
              </div>
              <MobileToggleItem label="تسجيل النشاط" description="حفظ سجل الدخول" defaultChecked />
            </MobileCard>

            <Button className="w-full" onClick={() => toast.success("تم حفظ الإعدادات")}>
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </>
        )}
      </div>
    </>
  );
}

export default function Settings() {
  return (
    <DashboardLayout
      title="الإعدادات"
      subtitle="إعدادات النظام والتكوين"
    >
      <SettingsContent />
    </DashboardLayout>
  );
}
