/**
 * الهيدر العلوي
 * S-ACM Frontend - Clean Tech Dashboard Theme
 */

import { Bell, Search, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { currentUser, dashboardStats } from "@/data/mockData";
import { MobileMenuButton } from "./Sidebar";
import { Link } from "wouter";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMobileMenuClick: () => void;
}

export function Header({ title, subtitle, onMobileMenuClick }: HeaderProps) {
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <MobileMenuButton onClick={onMobileMenuClick} />
        <div>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* البحث - مخفي على الموبايل */}
        <div className="hidden md:block relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            className="w-64 pr-10 bg-background border-border"
          />
        </div>

        {/* الإشعارات */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {dashboardStats.unread_notifications > 0 && (
                <span className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {dashboardStats.unread_notifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>الإشعارات</span>
              <Badge variant="secondary">{dashboardStats.unread_notifications} جديد</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-medium">تم رفع ملف جديد</span>
                </div>
                <p className="text-sm text-muted-foreground mr-4">
                  تم رفع المحاضرة الثانية في مقرر مقدمة في البرمجة
                </p>
                <span className="text-xs text-muted-foreground mr-4">منذ ساعة</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-medium">إعلان هام</span>
                </div>
                <p className="text-sm text-muted-foreground mr-4">
                  سيتم تأجيل محاضرة يوم الأحد
                </p>
                <span className="text-xs text-muted-foreground mr-4">منذ يوم</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="w-full text-center text-primary">
                عرض جميع الإشعارات
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* قائمة المستخدم */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(currentUser.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:block text-sm font-medium">
                {currentUser.full_name}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{currentUser.full_name}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {currentUser.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>الملف الشخصي</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>الإعدادات</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 ml-2" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
