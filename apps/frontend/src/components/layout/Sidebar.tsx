/**
 * القائمة الجانبية الديناميكية
 * S-ACM Frontend - Clean Tech Dashboard Theme
 * 
 * - تعرض العناصر حسب صلاحيات المستخدم
 * - قابلة للإخفاء والإظهار
 * - متجاوبة مع جميع الأجهزة
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { hasPermission, currentUser } from "@/data/mockData";
import {
  LayoutDashboard,
  Users,
  Shield,
  BookOpen,
  FolderOpen,
  GraduationCap,
  Bell,
  Sparkles,
  BarChart3,
  Settings,
  FileText,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  Trash2,
  User,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  permission?: string;
}

export const sidebarItems: MenuItem[] = [
  { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, href: "/dashboard" },
  { id: "users", label: "إدارة المستخدمين", icon: Users, href: "/users", permission: "view_users" },
  { id: "roles", label: "الأدوار والصلاحيات", icon: Shield, href: "/roles", permission: "view_roles" },
  { id: "courses", label: "إدارة المقررات", icon: BookOpen, href: "/courses", permission: "view_courses" },
  { id: "files", label: "كل الملفات", icon: FolderOpen, href: "/files", permission: "view_files" },
  { id: "academic", label: "البيانات الأكاديمية", icon: GraduationCap, href: "/academic", permission: "manage_majors" },
  { id: "notifications", label: "الإشعارات", icon: Bell, href: "/notifications" },
  { id: "ai", label: "الذكاء الاصطناعي", icon: Sparkles, href: "/ai", permission: "use_ai_summary" },
  { id: "reports", label: "التقارير", icon: BarChart3, href: "/reports", permission: "view_statistics" },
  { id: "settings", label: "الإعدادات", icon: Settings, href: "/settings", permission: "manage_settings" },
  { id: "logs", label: "سجلات النظام", icon: FileText, href: "/logs", permission: "view_audit_logs" },
  { id: "trash", label: "سلة المحذوفات", icon: Trash2, href: "/trash", permission: "manage_users" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const [location] = useLocation();

  // فلترة العناصر حسب الصلاحيات
  const visibleItems = sidebarItems.filter((item: MenuItem) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/dashboard" || location === "/";
    return location.startsWith(href);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2);
  };

  return (
    <>
      {/* Overlay للموبايل */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* القائمة الجانبية */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full bg-sidebar border-l border-sidebar-border z-50 transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* الهيدر مع زر الطي */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {/* زر الطي/التوسيع - في الأعلى بجانب الشعار */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                onClick={onToggle}
              >
                {collapsed ? (
                  <PanelRightOpen className="h-5 w-5" />
                ) : (
                  <PanelRightClose className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {collapsed ? "توسيع القائمة" : "طي القائمة"}
            </TooltipContent>
          </Tooltip>

          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center neon-glow-sm">
                <span className="text-primary font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="font-bold text-foreground">S-ACM</h1>
                <p className="text-xs text-muted-foreground">نظام إدارة المحتوى</p>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto neon-glow-sm">
              <span className="text-primary font-bold text-lg">S</span>
            </div>
          )}

          {/* زر الإغلاق للموبايل */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* عناصر القائمة */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {visibleItems.map((item: MenuItem) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              if (collapsed) {
                return (
                  <li key={item.id}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link href={item.href}>
                          <div
                            className={cn(
                              "flex items-center justify-center h-12 rounded-lg transition-all duration-200",
                              active
                                ? "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-primary"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                            onClick={onMobileClose}
                          >
                            <Icon className={cn("h-5 w-5", active && "text-primary")} />
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="bg-card border-border">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "sidebar-item",
                        active && "active"
                      )}
                      onClick={onMobileClose}
                    >
                      <Icon className={cn("h-5 w-5", active && "text-primary")} />
                      <span className={cn(active && "text-primary")}>{item.label}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* معلومات المستخدم مع رابط البروفايل */}
        <div className="p-3 border-t border-sidebar-border">
          <Link href="/profile">
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors cursor-pointer",
              collapsed && "justify-center",
              isActive("/profile") && "bg-sidebar-accent border-r-2 border-primary"
            )}>
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(currentUser.full_name)}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentUser.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.role.name}</p>
                </div>
              )}
              {!collapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // تسجيل الخروج
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>تسجيل الخروج</TooltipContent>
                </Tooltip>
              )}
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

// زر فتح القائمة للموبايل
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
}
