/**
 * القائمة المنزلقة للهاتف
 * S-ACM Frontend - Mobile App-Like Experience
 * 
 * - تظهر عند النقر على "المزيد" في شريط التنقل السفلي
 * - تحتوي على باقي الروابط
 * - تصميم يشبه التطبيقات الأصلية
 */

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { sidebarItems } from "./Sidebar";
import { hasPermission } from "@/data/mockData";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const [location] = useLocation();

  // العناصر التي لا تظهر في شريط التنقل السفلي
  const drawerItems = sidebarItems.filter((item) => {
    // استبعاد العناصر الموجودة في شريط التنقل السفلي
    const bottomNavPaths = ["/dashboard", "/users", "/courses", "/files"];
    if (bottomNavPaths.includes(item.href)) {
      return false;
    }
    // التحقق من الصلاحيات
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    return true;
  });

  if (!open) return null;

  return (
    <>
      {/* الخلفية المعتمة */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* القائمة المنزلقة من الأسفل */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
          "bg-card rounded-t-3xl",
          "max-h-[70svh] overflow-hidden",
          "animate-slide-up"
        )}
      >
        {/* المقبض */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        {/* العنوان */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
          <h3 className="text-lg font-semibold">المزيد</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* قائمة الروابط */}
        <div className="p-4 overflow-y-auto max-h-[calc(70svh-80px)] grid grid-cols-3 gap-3">
          {drawerItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + "/");

            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <div
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl",
                    "transition-all active:scale-95",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-6 w-6", isActive && "neon-text")} />
                  <span className="text-xs font-medium text-center leading-tight">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Safe area للأجهزة بـ notch */}
        <div className="h-6" />
      </div>
    </>
  );
}
