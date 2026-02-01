/**
 * S-ACM Frontend Prototype
 * نظام إدارة المحتوى الأكاديمي الذكي
 * Clean Tech Dashboard Theme
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

// الصفحات
import Login from "./pages/Login";
import Activate from "./pages/Activate";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Courses from "./pages/Courses";
import Files from "./pages/Files";
import Academic from "./pages/Academic";
import Notifications from "./pages/Notifications";
import AI from "./pages/AI";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import AuditLogs from "./pages/AuditLogs";
import Trash from "./pages/Trash";
import Viewer from "./pages/Viewer";
import Profile from "./pages/Profile";
import CourseDetails from "./pages/CourseDetails";

function Router() {
  return (
    <Switch>
      {/* إعادة توجيه الصفحة الرئيسية */}
      <Route path="/">
        <Redirect to="/login" />
      </Route>
      
      {/* صفحات المصادقة */}
      <Route path="/login" component={Login} />
      <Route path="/activate" component={Activate} />
      
      {/* لوحة التحكم */}
      <Route path="/dashboard" component={Dashboard} />
      
      {/* إدارة المستخدمين */}
      <Route path="/users" component={Users} />
      <Route path="/users/:tab" component={Users} />
      
      {/* الأدوار والصلاحيات */}
      <Route path="/roles" component={Roles} />
      <Route path="/roles/:tab" component={Roles} />
      
      {/* إدارة المقررات */}
      <Route path="/courses" component={Courses} />
      <Route path="/courses/:tab" component={Courses} />
      <Route path="/course/:id" component={CourseDetails} />
      
      {/* إدارة الملفات */}
      <Route path="/files" component={Files} />
      <Route path="/files/:tab" component={Files} />
      
      {/* عارض المحتوى */}
      <Route path="/viewer/:id" component={Viewer} />
      
      {/* البيانات الأكاديمية */}
      <Route path="/academic" component={Academic} />
      <Route path="/academic/:tab" component={Academic} />
      
      {/* الإشعارات */}
      <Route path="/notifications" component={Notifications} />
      <Route path="/notifications/:tab" component={Notifications} />
      
      {/* الذكاء الاصطناعي */}
      <Route path="/ai" component={AI} />
      <Route path="/ai/:tab" component={AI} />
      
      {/* الإعدادات */}
      <Route path="/settings" component={Settings} />
      <Route path="/settings/:tab" component={Settings} />
      
      {/* التقارير */}
      <Route path="/reports" component={Reports} />
      <Route path="/reports/:tab" component={Reports} />
      
      {/* سجلات التدقيق */}
      <Route path="/audit-logs" component={AuditLogs} />
      <Route path="/logs" component={AuditLogs} />
      
      {/* سلة المحذوفات */}
      <Route path="/trash" component={Trash} />
      <Route path="/trash/:tab" component={Trash} />
      
      {/* الملف الشخصي */}
      <Route path="/profile" component={Profile} />
      <Route path="/profile/:tab" component={Profile} />
      
      {/* صفحة 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
