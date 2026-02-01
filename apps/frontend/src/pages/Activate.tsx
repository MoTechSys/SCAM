/**
 * صفحة تفعيل الحساب
 * S-ACM Frontend - Clean Tech Dashboard Theme
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  GraduationCap,
  Mail,
  Key,
  User,
} from "lucide-react";
import { toast } from "sonner";

type Step = "verify" | "otp" | "password";

export default function Activate() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("verify");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // بيانات النموذج
  const [academicId, setAcademicId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicId || !cardNumber || !email) {
      toast.error("الرجاء إدخال جميع البيانات");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      setStep("otp");
    }, 1500);
  };

  const handleOtpVerify = async () => {
    if (otp.length !== 6) {
      toast.error("الرجاء إدخال رمز التحقق كاملاً");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("تم التحقق بنجاح");
      setStep("password");
    }, 1500);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("الرجاء إدخال كلمة المرور");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("تم تفعيل حسابك بنجاح!");
      setLocation("/login");
    }, 1500);
  };

  const steps = [
    { id: "verify", label: "التحقق", icon: User },
    { id: "otp", label: "رمز التحقق", icon: Mail },
    { id: "password", label: "كلمة المرور", icon: Key },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* الشعار */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">تفعيل الحساب</h1>
          <p className="text-muted-foreground">
            أكمل الخطوات التالية لتفعيل حسابك
          </p>
        </div>

        {/* مؤشر الخطوات */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isPast = steps.findIndex(st => st.id === step) > index;
            
            return (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isPast
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {isPast ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-1 ${
                      isPast ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Card className="border-border/50 shadow-2xl shadow-primary/5">
          <CardHeader className="text-center pb-2">
            <CardTitle>
              {step === "verify" && "التحقق من الهوية"}
              {step === "otp" && "إدخال رمز التحقق"}
              {step === "password" && "تعيين كلمة المرور"}
            </CardTitle>
            <CardDescription>
              {step === "verify" && "أدخل بياناتك للتحقق من هويتك"}
              {step === "otp" && "أدخل الرمز المرسل إلى بريدك الإلكتروني"}
              {step === "password" && "اختر كلمة مرور قوية لحسابك"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* خطوة التحقق */}
            {step === "verify" && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="academic_id">الرقم الأكاديمي</Label>
                  <Input
                    id="academic_id"
                    placeholder="أدخل الرقم الأكاديمي"
                    value={academicId}
                    onChange={(e) => setAcademicId(e.target.value)}
                    dir="ltr"
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card_number">رقم البطاقة</Label>
                  <Input
                    id="card_number"
                    placeholder="أدخل رقم البطاقة"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    dir="ltr"
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      التالي
                      <ArrowLeft className="h-4 w-4 mr-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* خطوة OTP */}
            {step === "otp" && (
              <div className="space-y-6">
                <div className="flex justify-center" dir="ltr">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  تم إرسال الرمز إلى: {email}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("verify")}
                    className="flex-1"
                  >
                    <ArrowRight className="h-4 w-4 ml-2" />
                    رجوع
                  </Button>
                  <Button
                    onClick={handleOtpVerify}
                    className="flex-1"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        تحقق
                        <ArrowLeft className="h-4 w-4 mr-2" />
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  variant="link"
                  className="w-full"
                  onClick={() => toast.info("تم إعادة إرسال الرمز")}
                >
                  إعادة إرسال الرمز
                </Button>
              </div>
            )}

            {/* خطوة كلمة المرور */}
            {step === "password" && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      dir="ltr"
                      className="pl-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirm_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    dir="ltr"
                  />
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className={password.length >= 8 ? "text-green-500" : ""}>
                    • 8 أحرف على الأقل
                  </li>
                  <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                    • حرف كبير واحد على الأقل
                  </li>
                  <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>
                    • رقم واحد على الأقل
                  </li>
                </ul>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري التفعيل...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 ml-2" />
                      تفعيل الحساب
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="link" onClick={() => setLocation("/login")}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة لتسجيل الدخول
          </Button>
        </div>
      </div>
    </div>
  );
}
