/**
 * صفحة الذكاء الاصطناعي
 * S-ACM Frontend - Mobile App-Like Experience
 */

import { useState, useEffect } from "react";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { MobileCard } from "@/components/ui/mobile-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { files } from "@/data/mockData";
import {
  FileText,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Loader2,
  Copy,
  Download,
  CheckCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const pageTabs: Tab[] = [
  { id: "summary", label: "التلخيص", icon: FileText },
  { id: "questions", label: "توليد الأسئلة", icon: HelpCircle },
  { id: "chat", label: "اسأل المستند", icon: MessageSquare },
];

// بيانات وهمية للعرض
const mockSummary = `
## ملخص المحاضرة الأولى - مقدمة في Python

### النقاط الرئيسية:

1. **ما هي Python؟**
   - لغة برمجة عالية المستوى
   - سهلة التعلم والقراءة
   - متعددة الاستخدامات

2. **مميزات Python:**
   - بناء جملة بسيط وواضح
   - مكتبات ضخمة
   - مجتمع كبير وداعم

3. **استخدامات Python:**
   - تطوير الويب
   - علم البيانات
   - الذكاء الاصطناعي
   - الأتمتة

### الخلاصة:
Python هي لغة برمجة مثالية للمبتدئين وتستخدم في مجالات متعددة.
`;

const mockQuestions = [
  {
    id: 1,
    type: "mcq",
    question: "ما هي Python؟",
    options: [
      "لغة برمجة عالية المستوى",
      "نظام تشغيل",
      "قاعدة بيانات",
      "متصفح ويب",
    ],
    answer: 0,
  },
  {
    id: 2,
    type: "true_false",
    question: "Python لغة صعبة التعلم",
    answer: false,
  },
  {
    id: 3,
    type: "short",
    question: "اذكر ثلاث استخدامات للغة Python",
    answer: "تطوير الويب، علم البيانات، الذكاء الاصطناعي",
  },
];

const mockChatMessages = [
  {
    id: 1,
    role: "user",
    content: "ما هي مميزات Python؟",
  },
  {
    id: 2,
    role: "assistant",
    content:
      "مميزات Python تشمل:\n\n1. **سهولة التعلم**: بناء جملة بسيط وواضح\n2. **مكتبات ضخمة**: آلاف المكتبات الجاهزة\n3. **متعددة الاستخدامات**: تطوير ويب، AI، علم بيانات\n4. **مجتمع كبير**: دعم ومساعدة متوفرة",
  },
];

function AIContent() {
  const { activeTab, setTabs, setActiveTab } = useTabs();
  const [selectedFile, setSelectedFile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [questionType, setQuestionType] = useState("mixed");
  const [questionCount, setQuestionCount] = useState("5");

  // تعيين التبويبات عند تحميل الصفحة
  useEffect(() => {
    setTabs(pageTabs);
    setActiveTab("summary");
  }, [setTabs, setActiveTab]);

  const handleGenerate = () => {
    if (!selectedFile) {
      toast.error("الرجاء اختيار ملف أولاً");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowResult(true);
      toast.success("تم التوليد بنجاح");
    }, 2000);
  };

  const usageStats = {
    used: 7,
    limit: 10,
    resetIn: "53 دقيقة",
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* إحصائيات الاستخدام */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">استخدامك اليوم</p>
                  <p className="text-sm text-muted-foreground">
                    {usageStats.used} من {usageStats.limit} طلبات
                  </p>
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <Progress
                  value={(usageStats.used / usageStats.limit) * 100}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1 text-left">
                  يتم التجديد خلال {usageStats.resetIn}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* التلخيص */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>اختر الملف</CardTitle>
                <CardDescription>اختر ملفاً لتلخيصه</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedFile} onValueChange={setSelectedFile}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر ملفاً" />
                  </SelectTrigger>
                  <SelectContent>
                    {files
                      .filter((f) => f.content_type === "local")
                      .map((file) => (
                        <SelectItem key={file.id} value={String(file.id)}>
                          {file.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {selectedFile && (
                  <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                    <p className="font-medium">
                      {files.find((f) => String(f.id) === selectedFile)?.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {files.find((f) => String(f.id) === selectedFile)?.course.name}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isLoading || !selectedFile}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري التلخيص...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 ml-2" />
                      توليد الملخص
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>الملخص</CardTitle>
                  {showResult && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(mockSummary);
                          toast.success("تم النسخ");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toast.info("تحميل الملخص")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showResult ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: mockSummary.replace(/\n/g, "<br />"),
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>اختر ملفاً وانقر على "توليد الملخص"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* توليد الأسئلة */}
        {activeTab === "questions" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات التوليد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الملف</label>
                  <Select value={selectedFile} onValueChange={setSelectedFile}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر ملفاً" />
                    </SelectTrigger>
                    <SelectContent>
                      {files
                        .filter((f) => f.content_type === "local")
                        .map((file) => (
                          <SelectItem key={file.id} value={String(file.id)}>
                            {file.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع الأسئلة</label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">متنوعة</SelectItem>
                      <SelectItem value="mcq">اختيار من متعدد</SelectItem>
                      <SelectItem value="true_false">صح وخطأ</SelectItem>
                      <SelectItem value="short">إجابة قصيرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">عدد الأسئلة</label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 أسئلة</SelectItem>
                      <SelectItem value="5">5 أسئلة</SelectItem>
                      <SelectItem value="10">10 أسئلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isLoading || !selectedFile}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-4 w-4 ml-2" />
                      توليد الأسئلة
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>الأسئلة المولدة</CardTitle>
                  {showResult && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("تصدير الأسئلة")}
                    >
                      <Download className="h-4 w-4 ml-2" />
                      تصدير
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showResult ? (
                  <div className="space-y-4">
                    {mockQuestions.map((q, index) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-lg border border-border"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {q.type === "mcq" && "اختيار من متعدد"}
                                {q.type === "true_false" && "صح وخطأ"}
                                {q.type === "short" && "إجابة قصيرة"}
                              </Badge>
                            </div>
                            <p className="font-medium mb-3">{q.question}</p>
                            {q.type === "mcq" && q.options && (
                              <div className="space-y-2">
                                {q.options.map((opt, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "p-2 rounded border",
                                      i === q.answer
                                        ? "border-primary bg-primary/10"
                                        : "border-border"
                                    )}
                                  >
                                    {opt}
                                    {i === q.answer && (
                                      <CheckCircle className="h-4 w-4 inline mr-2 text-primary" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.type === "true_false" && (
                              <div className="flex gap-4">
                                <Badge
                                  className={
                                    q.answer === true ? "badge-success" : ""
                                  }
                                >
                                  صح
                                </Badge>
                                <Badge
                                  className={
                                    q.answer === false ? "badge-danger" : ""
                                  }
                                >
                                  خطأ
                                </Badge>
                              </div>
                            )}
                            {q.type === "short" && (
                              <div className="p-2 rounded bg-muted/30 text-sm">
                                <strong>الإجابة:</strong> {q.answer}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>اختر ملفاً وانقر على "توليد الأسئلة"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* اسأل المستند */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>اختر الملف</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedFile} onValueChange={setSelectedFile}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر ملفاً" />
                  </SelectTrigger>
                  <SelectContent>
                    {files
                      .filter((f) => f.content_type === "local")
                      .map((file) => (
                        <SelectItem key={file.id} value={String(file.id)}>
                          {file.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>المحادثة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-80 overflow-y-auto space-y-4 p-4 rounded-lg bg-muted/20">
                  {selectedFile ? (
                    mockChatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.role === "user" ? "justify-start" : "justify-end"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] p-3 rounded-lg",
                            msg.role === "user"
                              ? "bg-muted"
                              : "bg-primary text-primary-foreground"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>اختر ملفاً للبدء في المحادثة</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="اكتب سؤالك هنا..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    rows={2}
                    disabled={!selectedFile}
                  />
                  <Button
                    disabled={!selectedFile || !chatInput.trim()}
                    onClick={() => {
                      toast.success("تم إرسال السؤال");
                      setChatInput("");
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        {/* إحصائيات الاستخدام - موبايل */}
        <MobileCard>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">استخدامك اليوم</p>
              <p className="text-xs text-muted-foreground">
                {usageStats.used} من {usageStats.limit} طلبات
              </p>
            </div>
          </div>
          <Progress
            value={(usageStats.used / usageStats.limit) * 100}
            className="h-1.5"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            يتم التجديد خلال {usageStats.resetIn}
          </p>
        </MobileCard>

        {/* التلخيص - موبايل */}
        {activeTab === "summary" && (
          <>
            <MobileCard>
              <h3 className="font-semibold text-sm mb-3">اختر الملف</h3>
              <Select value={selectedFile} onValueChange={setSelectedFile}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="اختر ملفاً" />
                </SelectTrigger>
                <SelectContent>
                  {files
                    .filter((f) => f.content_type === "local")
                    .map((file) => (
                      <SelectItem key={file.id} value={String(file.id)}>
                        {file.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {selectedFile && (
                <div className="mt-3 p-2 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium truncate">
                    {files.find((f) => String(f.id) === selectedFile)?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {files.find((f) => String(f.id) === selectedFile)?.course.name}
                  </p>
                </div>
              )}

              <Button
                className="w-full mt-3"
                size="sm"
                onClick={handleGenerate}
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 ml-2 animate-spin" />
                    جاري التلخيص...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 ml-2" />
                    توليد الملخص
                  </>
                )}
              </Button>
            </MobileCard>

            {showResult ? (
              <MobileCard>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">الملخص</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        navigator.clipboard.writeText(mockSummary);
                        toast.success("تم النسخ");
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toast.info("تحميل الملخص")}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: mockSummary.replace(/\n/g, "<br />"),
                    }}
                  />
                </div>
              </MobileCard>
            ) : (
              <MobileCard>
                <div className="text-center py-6 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">اختر ملفاً وانقر على "توليد الملخص"</p>
                </div>
              </MobileCard>
            )}
          </>
        )}

        {/* توليد الأسئلة - موبايل */}
        {activeTab === "questions" && (
          <>
            <MobileCard>
              <h3 className="font-semibold text-sm mb-3">إعدادات التوليد</h3>
              <div className="space-y-3">
                <Select value={selectedFile} onValueChange={setSelectedFile}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="اختر ملفاً" />
                  </SelectTrigger>
                  <SelectContent>
                    {files
                      .filter((f) => f.content_type === "local")
                      .map((file) => (
                        <SelectItem key={file.id} value={String(file.id)}>
                          {file.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">متنوعة</SelectItem>
                      <SelectItem value="mcq">اختيار متعدد</SelectItem>
                      <SelectItem value="true_false">صح وخطأ</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="العدد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 أسئلة</SelectItem>
                      <SelectItem value="5">5 أسئلة</SelectItem>
                      <SelectItem value="10">10 أسئلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full mt-3"
                size="sm"
                onClick={handleGenerate}
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 ml-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <HelpCircle className="h-3 w-3 ml-2" />
                    توليد الأسئلة
                  </>
                )}
              </Button>
            </MobileCard>

            {showResult ? (
              <div className="space-y-2">
                {mockQuestions.map((q, index) => (
                  <MobileCard key={q.id}>
                    <div className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className="text-[10px] mb-1">
                          {q.type === "mcq" && "اختيار متعدد"}
                          {q.type === "true_false" && "صح وخطأ"}
                          {q.type === "short" && "إجابة قصيرة"}
                        </Badge>
                        <p className="text-sm font-medium mb-2">{q.question}</p>
                        {q.type === "mcq" && q.options && (
                          <div className="space-y-1">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "p-1.5 rounded text-xs",
                                  i === q.answer
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted/30"
                                )}
                              >
                                {opt}
                                {i === q.answer && (
                                  <CheckCircle className="h-3 w-3 inline mr-1" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.type === "true_false" && (
                          <div className="flex gap-2">
                            <Badge
                              className={cn(
                                "text-[10px]",
                                q.answer === true ? "badge-success" : ""
                              )}
                            >
                              صح
                            </Badge>
                            <Badge
                              className={cn(
                                "text-[10px]",
                                q.answer === false ? "badge-danger" : ""
                              )}
                            >
                              خطأ
                            </Badge>
                          </div>
                        )}
                        {q.type === "short" && (
                          <div className="p-1.5 rounded bg-muted/30 text-xs">
                            <strong>الإجابة:</strong> {q.answer}
                          </div>
                        )}
                      </div>
                    </div>
                  </MobileCard>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.info("تصدير الأسئلة")}
                >
                  <Download className="h-3 w-3 ml-2" />
                  تصدير الأسئلة
                </Button>
              </div>
            ) : (
              <MobileCard>
                <div className="text-center py-6 text-muted-foreground">
                  <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">اختر ملفاً وانقر على "توليد الأسئلة"</p>
                </div>
              </MobileCard>
            )}
          </>
        )}

        {/* اسأل المستند - موبايل */}
        {activeTab === "chat" && (
          <>
            <MobileCard>
              <Select value={selectedFile} onValueChange={setSelectedFile}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="اختر ملفاً للمحادثة" />
                </SelectTrigger>
                <SelectContent>
                  {files
                    .filter((f) => f.content_type === "local")
                    .map((file) => (
                      <SelectItem key={file.id} value={String(file.id)}>
                        {file.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </MobileCard>

            <MobileCard className="flex-1">
              <div className="h-48 overflow-y-auto space-y-2 mb-3">
                {selectedFile ? (
                  mockChatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] p-2 rounded-lg text-xs",
                          msg.role === "user"
                            ? "bg-muted"
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">اختر ملفاً للبدء</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="اكتب سؤالك..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  rows={1}
                  disabled={!selectedFile}
                  className="text-sm min-h-[36px] resize-none"
                />
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={!selectedFile || !chatInput.trim()}
                  onClick={() => {
                    toast.success("تم إرسال السؤال");
                    setChatInput("");
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </MobileCard>
          </>
        )}
      </div>
    </>
  );
}

export default function AI() {
  return (
    <DashboardLayout
      title="الذكاء الاصطناعي"
      subtitle="استخدم AI لتلخيص الملفات وتوليد الأسئلة"
    >
      <AIContent />
    </DashboardLayout>
  );
}
