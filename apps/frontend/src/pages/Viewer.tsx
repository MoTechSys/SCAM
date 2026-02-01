/**
 * صفحة عارض المحتوى
 * S-ACM Frontend - Clean Tech Dashboard Theme
 * عارض متكيف مع نوع المحتوى (PDF, فيديو, رابط خارجي)
 */

import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { files, fileTypes } from "@/data/mockData";
import {
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  FileCheck,
  ClipboardList,
  File,
  Play,
  Maximize2,
  Minimize2,
  Share2,
  Sparkles,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const getFileIcon = (type: string) => {
  switch (type) {
    case "lecture":
      return FileText;
    case "summary":
      return FileCheck;
    case "exam":
      return ClipboardList;
    default:
      return File;
  }
};

export default function Viewer() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const file = files.find((f) => f.id === Number(id));

  if (!file) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">الملف غير موجود</h2>
          <p className="text-muted-foreground mb-4">لم يتم العثور على الملف المطلوب</p>
          <Button onClick={() => navigate("/files")}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للملفات
          </Button>
        </Card>
      </div>
    );
  }

  const Icon = getFileIcon(file.file_type);
  const isExternal = file.content_type === "external";
  const isVideo = isExternal && file.external_url?.includes("youtube");
  const isPDF = file.file_extension === "pdf";

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // استخراج معرف فيديو يوتيوب
  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0] || "dQw4w9WgXcQ";
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className={`min-h-screen bg-[#0a0f1a] ${isFullscreen ? 'p-0' : 'p-4'}`}>
      {/* الهيدر */}
      {!isFullscreen && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            {/* معلومات الملف */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/files")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div className="p-3 rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{file.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{file.course.code}</span>
                  <span>•</span>
                  <span>{file.course.name}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {fileTypes.find((t) => t.code === file.file_type)?.name}
                  </Badge>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex items-center gap-2">
              {/* أدوات AI */}
              <div className="hidden md:flex items-center gap-1 border-l border-border/50 pl-2 mr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => toast.info("جاري تلخيص الملف...")}
                >
                  <Sparkles className="h-4 w-4 ml-1" />
                  تلخيص
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => toast.info("جاري توليد الأسئلة...")}
                >
                  <HelpCircle className="h-4 w-4 ml-1" />
                  أسئلة
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => toast.info("فتح المحادثة...")}
                >
                  <MessageSquare className="h-4 w-4 ml-1" />
                  اسأل
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => toast.info("تم نسخ الرابط")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              {!isExternal && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toast.success("جاري التحميل...")}
                  className="text-muted-foreground hover:text-green-500"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              
              {isExternal && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(file.external_url, "_blank")}
                  className="text-muted-foreground hover:text-blue-500"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-muted-foreground hover:text-foreground"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* منطقة العرض */}
      <div className={`max-w-7xl mx-auto ${isFullscreen ? 'h-screen' : ''}`}>
        <Card className={`overflow-hidden border-border/50 bg-card/30 backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : ''}`}>
          <CardContent className={`p-0 ${isFullscreen ? 'h-full' : ''}`}>
            {/* عارض الفيديو */}
            {isVideo && (
              <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'}`}>
                <iframe
                  src={getYoutubeEmbedUrl(file.external_url || "")}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* عارض PDF */}
            {isPDF && !isExternal && (
              <div className={`relative ${isFullscreen ? 'h-full' : 'h-[80vh]'}`}>
                {/* محاكاة عارض PDF */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
                  <div className="text-center">
                    <div className="w-32 h-40 mx-auto mb-6 bg-white rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-8 bg-red-500" />
                      <FileText className="h-12 w-12 text-slate-400 mt-4" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{file.title}</h3>
                    <p className="text-slate-400 mb-6">ملف PDF - {file.file_size ? Math.round(file.file_size / 1024 / 1024 * 100) / 100 : 0} MB</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => toast.success("جاري فتح الملف...")}>
                        <Play className="h-4 w-4 ml-2" />
                        فتح الملف
                      </Button>
                      <Button variant="outline" onClick={() => toast.success("جاري التحميل...")}>
                        <Download className="h-4 w-4 ml-2" />
                        تحميل
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* رابط خارجي (غير يوتيوب) */}
            {isExternal && !isVideo && (
              <div className="h-[60vh] flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ExternalLink className="h-12 w-12 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{file.title}</h3>
                  <p className="text-slate-400 mb-2">رابط خارجي</p>
                  <p className="text-sm text-slate-500 mb-6 font-mono" dir="ltr">
                    {file.external_url}
                  </p>
                  <Button onClick={() => window.open(file.external_url, "_blank")}>
                    <ExternalLink className="h-4 w-4 ml-2" />
                    فتح الرابط
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* معلومات إضافية */}
      {!isFullscreen && (
        <div className="max-w-7xl mx-auto mt-4">
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">الوصف</h4>
                  <p className="text-foreground">{file.description || "لا يوجد وصف"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">رفع بواسطة</h4>
                  <p className="text-foreground">{file.uploaded_by.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">تاريخ الرفع</h4>
                  <p className="text-foreground">{file.created_at}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
