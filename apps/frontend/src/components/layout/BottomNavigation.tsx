/**
 * شريط التنقل السفلي للهاتف
 * S-ACM Frontend - Mobile App-Like Experience
 * 
 * - يظهر فقط على الهاتف
 * - 5 عناصر رئيسية للتنقل السريع
 * - تصميم يشبه التطبيقات الأصلية
 */

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Bell,
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "الرئيسية" },
  { href: "/users", icon: Users, label: "المستخدمين" },
  { href: "/courses", icon: BookOpen, label: "المقررات" },
  { href: "/notifications", icon: Bell, label: "الإشعارات" },
  { href: "#more", icon: Menu, label: "المزيد", isMore: true },
];

interface BottomNavigationProps {
  onMoreClick: () => void;
}

export function BottomNavigation({ onMoreClick }: BottomNavigationProps) {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" 
            ? location === "/" 
            : location.startsWith(item.href);

          if (item.isMore) {
            return (
              <button
                key={item.href}
                onClick={onMoreClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full",
                  "text-muted-foreground transition-colors",
                  "active:bg-accent/50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full px-2",
                  "transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:bg-accent/50"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive && "bg-primary/10"
                )}>
                  <Icon className={cn("h-5 w-5", isActive && "neon-text")} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive && "text-primary"
                )}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
