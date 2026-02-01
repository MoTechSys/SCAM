/**
 * التخطيط الرئيسي للوحة التحكم
 * S-ACM Frontend - Mobile App-Like Experience
 * 
 * - يحتوي على القائمة الجانبية والهيدر
 * - شريط تنقل سفلي للهاتف
 * - تصميم يشبه التطبيق الأصلي على الهاتف
 * - شريط التبويبات ثابت عند التمرير
 */

import { useState, useEffect, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";
import { MobileDrawer } from "./MobileDrawer";
import { LucideIcon, User, Settings, LogOut, Bell } from "lucide-react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Context للتبويبات
interface TabsContextType {
  tabs: Tab[];
  activeTab: string;
  setTabs: (tabs: Tab[]) => void;
  setActiveTab: (tab: string) => void;
}

export interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
}

const TabsContext = createContext<TabsContextType | null>(null);

export function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within DashboardLayout");
  }
  return context;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

// مكون الهيدر للموبايل مع قائمة البروفايل
function MobileHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const [, navigate] = useLocation();
  const notificationCount = 3; // عدد الإشعارات غير المقروءة

  return (
    <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-border bg-card/95 backdrop-blur-md">
      {/* الجانب الأيمن - الشعار والعنوان */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">S</span>
        </div>
        <div>
          <h1 className="font-semibold text-sm leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {/* الجانب الأيسر - الإشعارات وقائمة المستخدم */}
      <div className="flex items-center gap-1">
        {/* زر الإشعارات */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -left-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary">
              {notificationCount}
            </Badge>
          )}
        </Button>

        {/* قائمة المستخدم */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">م</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">مدير النظام</p>
              <p className="text-xs text-muted-foreground">admin@sacm.edu</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="h-4 w-4 ml-2" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4 ml-2" />
              الإعدادات
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                toast.success("تم تسجيل الخروج");
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  // حالة طي القائمة - نقرأها من localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  // حالة القائمة على الموبايل
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // حالة القائمة المنزلقة (المزيد)
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // حالة التبويبات
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState("");

  // حفظ حالة الطي
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  // إغلاق القائمة عند تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <TabsContext.Provider value={{ tabs, activeTab, setTabs, setActiveTab }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen bg-background flex-col">
        {/* القائمة الجانبية */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* المحتوى الرئيسي */}
        <div
          className={cn(
            "transition-all duration-300 flex flex-col flex-1",
            collapsed ? "lg:mr-20" : "lg:mr-72"
          )}
        >
          {/* الهيدر + التبويبات - ثابتين عند التمرير */}
          <div className="sticky top-0 z-40 bg-background">
            <Header
              title={title}
              subtitle={subtitle}
              onMobileMenuClick={() => setMobileOpen(true)}
            />
            
            {/* شريط التبويبات */}
            {tabs.length > 0 && (
              <div className="border-b border-border bg-background/95 backdrop-blur-sm px-4 lg:px-6 py-2">
                <nav className="flex gap-1 overflow-x-auto pb-px -mb-px scrollbar-hide">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "tab-item flex items-center gap-2 whitespace-nowrap",
                          isActive && "active"
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs rounded-full",
                            isActive 
                              ? "bg-primary/20 text-primary" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <main className="flex-1 p-4 lg:p-6 animate-fade-in overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout - App-Like Experience */}
      <div className="lg:hidden flex flex-col h-[100svh] bg-background overflow-hidden">
        {/* الهيدر المصغر للموبايل */}
        <MobileHeader title={title} subtitle={subtitle} />

        {/* شريط التبويبات للموبايل - تمرير أفقي */}
        {tabs.length > 0 && (
          <div className="flex-shrink-0 border-b border-border bg-background">
            <div 
              className="flex gap-1 overflow-x-auto px-2 py-1.5"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all flex-shrink-0",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={cn(
                        "px-1 py-0 text-[9px] rounded-full min-w-[14px] text-center",
                        isActive 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* المحتوى - يملأ المساحة المتبقية */}
        <main className="flex-1 overflow-auto overscroll-contain">
          <div className="p-3 pb-20 mobile-content">
            {children}
          </div>
        </main>

        {/* شريط التنقل السفلي */}
        <BottomNavigation onMoreClick={() => setDrawerOpen(true)} />

        {/* القائمة المنزلقة */}
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </TabsContext.Provider>
  );
}
