/**
 * صفحة الأدوار والصلاحيات
 * S-ACM Frontend - متصلة بـ Backend API
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout, useTabs, Tab } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { rolesApi, Role } from "@/lib/api";
import {
  List,
  Plus,
  Shield,
  Pencil,
  Trash2,
  Eye,
  Users,
  Lock,
  MoreVertical,
  Loader2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const pageTabs: Tab[] = [
  { id: "list", label: "قائمة الأدوار", icon: List },
  { id: "add", label: "إضافة دور", icon: Plus },
  { id: "permissions", label: "الصلاحيات", icon: Shield },
];

function RolesContent() {
  const { activeTab, setTabs, setActiveTab } = useTabs();
  
  // State
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  
  // Edit dialog
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Delete dialog
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setTabs(pageTabs);
    setActiveTab("list");
  }, [setTabs, setActiveTab]);

  // جلب البيانات
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await rolesApi.getAll();
      if (response.success && response.data) {
        setRoles(response.data.data || response.data || []);
      } else {
        setRoles([]);
      }
    } catch (error) {
      toast.error("فشل في جلب الأدوار");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await rolesApi.getPermissions();
      if (response.success && response.data) {
        setAllPermissions(response.data.data || response.data || []);
      } else {
        setAllPermissions([]);
      }
    } catch (error) {
      console.error("Failed to fetch permissions");
      setAllPermissions([]);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles]);

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code)
        ? prev.filter((p) => p !== code)
        : [...prev, code]
    );
  };

  const toggleCategory = (categoryPermissions: string[]) => {
    const allSelected = categoryPermissions.every((p) =>
      selectedPermissions.includes(p)
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !categoryPermissions.includes(p))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        ...categoryPermissions.filter((p) => !prev.includes(p)),
      ]);
    }
  };

  // إضافة دور
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("الرجاء إدخال اسم الدور");
      return;
    }

    setFormLoading(true);
    try {
      const response = await rolesApi.create({
        name: formData.name,
        description: formData.description,
        permissions: selectedPermissions,
      });

      if (response.success) {
        toast.success("تم إضافة الدور بنجاح");
        setFormData({ name: "", description: "" });
        setSelectedPermissions([]);
        setActiveTab("list");
        fetchRoles();
      } else {
        toast.error(response.error || "فشل في إضافة الدور");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setFormLoading(false);
    }
  };

  // تعديل دور
  const handleEditRole = async () => {
    if (!editRole) return;

    setFormLoading(true);
    try {
      const response = await rolesApi.update(editRole.id, {
        name: editRole.name,
        description: editRole.description,
        permissions: editRole.permissions,
      });

      if (response.success) {
        toast.success("تم تحديث الدور بنجاح");
        setEditDialogOpen(false);
        setEditRole(null);
        fetchRoles();
      } else {
        toast.error(response.error || "فشل في تحديث الدور");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setFormLoading(false);
    }
  };

  // حذف دور
  const handleDeleteRole = async () => {
    if (!deleteRole) return;

    setFormLoading(true);
    try {
      const response = await rolesApi.delete(deleteRole.id);

      if (response.success) {
        toast.success("تم حذف الدور بنجاح");
        setDeleteDialogOpen(false);
        setDeleteRole(null);
        fetchRoles();
      } else {
        toast.error(response.error || "فشل في حذف الدور");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setFormLoading(false);
    }
  };

  // تحويل الصلاحيات لمصفوفة
  const permissionCategories = Object.entries(allPermissions).map(([key, value]: [string, any]) => ({
    code: key,
    name: value.name || key,
    permissions: value.permissions || [],
  }));

  return (
    <>
      {/* قائمة الأدوار */}
      {activeTab === "list" && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* قائمة الأدوار - موبايل */}
              <div className="lg:hidden space-y-2">
                {roles.map((role) => (
                  <Card key={role.id} className="card-hover">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm truncate">{role.name}</h3>
                            {role.isSystem ? (
                              <Badge className="badge-info text-[10px] px-1.5">
                                <Lock className="h-2.5 w-2.5 ml-0.5" />
                                نظامي
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-1.5">مخصص</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {role.usersCount}
                            </span>
                            <span>{role.permissionsCount} صلاحية</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditRole(role); setEditDialogOpen(true); }}>
                              <Pencil className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            {!role.isSystem && (
                              <DropdownMenuItem 
                                onClick={() => { setDeleteRole(role); setDeleteDialogOpen(true); }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* جدول الأدوار - Desktop */}
              <Card className="hidden lg:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-right p-4 font-medium">اسم الدور</th>
                          <th className="text-right p-4 font-medium">الوصف</th>
                          <th className="text-right p-4 font-medium">المستخدمين</th>
                          <th className="text-right p-4 font-medium">النوع</th>
                          <th className="text-right p-4 font-medium">الصلاحيات</th>
                          <th className="text-right p-4 font-medium">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roles.map((role) => (
                          <tr key={role.id} className="border-t border-border hover:bg-muted/30">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <p className="font-medium">{role.name}</p>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{role.description || "-"}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{role.usersCount}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              {role.isSystem ? (
                                <Badge className="badge-info">
                                  <Lock className="h-3 w-3 ml-1" />
                                  نظامي
                                </Badge>
                              ) : (
                                <Badge variant="outline">مخصص</Badge>
                              )}
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {role.permissionsCount} صلاحية
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                  onClick={() => { setEditRole(role); setEditDialogOpen(true); }}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                {!role.isSystem && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                                    onClick={() => { setDeleteRole(role); setDeleteDialogOpen(true); }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* إضافة دور */}
      {activeTab === "add" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-base lg:text-lg">معلومات الدور</CardTitle>
              <CardDescription className="text-xs lg:text-sm">أدخل بيانات الدور الجديد</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="role_name" className="text-xs lg:text-sm">اسم الدور *</Label>
                  <Input 
                    id="role_name" 
                    placeholder="مثال: مشرف قسم" 
                    className="h-9 text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role_desc" className="text-xs lg:text-sm">الوصف</Label>
                  <Input 
                    id="role_desc" 
                    placeholder="وصف مختصر للدور" 
                    className="h-9 text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الصلاحيات */}
          <Card>
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-base lg:text-lg">الصلاحيات</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                حدد الصلاحيات المطلوبة ({selectedPermissions.length} محددة)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {permissionCategories.map((category) => (
                  <AccordionItem key={category.code} value={category.code}>
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={category.permissions.every((p: any) => selectedPermissions.includes(p.code))}
                          onCheckedChange={() => toggleCategory(category.permissions.map((p: any) => p.code))}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span>{category.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {category.permissions.filter((p: any) => selectedPermissions.includes(p.code)).length}/{category.permissions.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-6">
                        {category.permissions.map((permission: any) => (
                          <div key={permission.code} className="flex items-center gap-2">
                            <Checkbox
                              id={permission.code}
                              checked={selectedPermissions.includes(permission.code)}
                              onCheckedChange={() => togglePermission(permission.code)}
                            />
                            <Label htmlFor={permission.code} className="text-xs cursor-pointer">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setActiveTab("list")}>إلغاء</Button>
            <Button onClick={handleAddRole} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 ml-2" />
              )}
              إضافة الدور
            </Button>
          </div>
        </div>
      )}

      {/* عرض الصلاحيات */}
      {activeTab === "permissions" && (
        <Card>
          <CardHeader>
            <CardTitle>قائمة الصلاحيات</CardTitle>
            <CardDescription>جميع الصلاحيات المتاحة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {permissionCategories.map((category) => (
                <AccordionItem key={category.code} value={category.code}>
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>{category.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {category.permissions.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pr-6">
                      {category.permissions.map((permission: any) => (
                        <div key={permission.code} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                          <Lock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{permission.name}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الدور</DialogTitle>
            <DialogDescription>قم بتعديل بيانات الدور</DialogDescription>
          </DialogHeader>
          {editRole && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم الدور</Label>
                <Input
                  value={editRole.name}
                  onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                  disabled={editRole.isSystem}
                />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea
                  value={editRole.description || ""}
                  onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الصلاحيات ({editRole.permissions.length} محددة)</Label>
                <Accordion type="multiple" className="w-full">
                  {permissionCategories.map((category) => (
                    <AccordionItem key={category.code} value={category.code}>
                      <AccordionTrigger className="text-sm hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span>{category.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2 pr-4">
                          {category.permissions.map((permission: any) => (
                            <div key={permission.code} className="flex items-center gap-2">
                              <Checkbox
                                id={`edit-${permission.code}`}
                                checked={editRole.permissions.includes(permission.code)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setEditRole({
                                      ...editRole,
                                      permissions: [...editRole.permissions, permission.code],
                                    });
                                  } else {
                                    setEditRole({
                                      ...editRole,
                                      permissions: editRole.permissions.filter((p) => p !== permission.code),
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={`edit-${permission.code}`} className="text-xs cursor-pointer">
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleEditRole} disabled={formLoading}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الدور</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الدور "{deleteRole?.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteRole} disabled={formLoading}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Roles() {
  return (
    <DashboardLayout title="الأدوار والصلاحيات">
      <RolesContent />
    </DashboardLayout>
  );
}
