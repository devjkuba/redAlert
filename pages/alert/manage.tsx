import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { availableIcons } from "@/constants/icons";
import useUser from "@/hooks/useUser";
import useAuthToken from "@/hooks/useAuthToken";
import { useAlertTypes, AlertTypeData } from "@/hooks/useAlertTypes";
import SortableItem from "@/components/SortableItem";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Navbar from "@/components/Navbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import router from "next/router";

export default function ManageAlertsPage() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const token = useAuthToken();
  const {
    alerts,
    isLoading,
    isResetting,
    resetAlerts,
    addAlert,
    editAlert,
    removeAlert,
    reorderAlerts,
  } = useAlertTypes(user?.organizationId ?? 0, token);

  const [sortedAlerts, setSortedAlerts] = useState<AlertTypeData[]>([]);
  const [editing, setEditing] = useState<AlertTypeData | null>(null);
  const isNew = editing !== null && !("id" in editing);
  const [form, setForm] = useState({
    label: "",
    icon: "AlertTriangle",
    className: "#ffffff",
  });

    useEffect(() => {
    if (!isUserLoading) {
      const isAdmin =
        (!user?.isDevice && user?.role === "ADMIN") ||
        (!user?.isDevice && user?.role === "SUPERADMIN");

      if (!isAdmin) {
        router.replace("/alert");
      }
    }
  }, [isUserLoading, user]);

  useEffect(() => {
    if (alerts) setSortedAlerts(alerts);
  }, [alerts]);

  const openAdd = () => {
    setEditing({
      label: "",
      icon: "AlertTriangle",
      organizationId: user?.organizationId ?? 0,
      order: 0,
      className: "#ffffff",
      id: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AlertTypeData);
    setForm({ label: "", icon: "AlertTriangle", className: "#ffffff" });
  };

  const openEdit = (a: AlertTypeData) => {
    setEditing(a);
    setForm({
      label: a.label,
      icon: a.icon,
      className: a.className || "#ffffff",
    });
  };

  const submit = () => {
    const payload: AlertTypeData = {
      ...form,
      organizationId: user?.organizationId ?? 0,
      id: editing?.id ?? 0,
      className: form.className,
      order: editing?.order ?? 0,
      createdAt: editing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
    if (isNew) {
      addAlert(payload, { onSuccess: () => setEditing(null) });
    } else {
      editAlert(
        { id: editing!.id, data: payload },
        { onSuccess: () => setEditing(null) }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Opravdu smazat notifikaci?")) {
      removeAlert(id, { onSuccess: () => setEditing(null) });
    }
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sortedAlerts.findIndex(
        (s) => s.id === Number(active.id)
      );
      const newIndex = sortedAlerts.findIndex((s) => s.id === Number(over?.id));
      const items = [...sortedAlerts];
      const [moved] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, moved);
      setSortedAlerts(items);
      reorderAlerts(items.map((s, idx) => ({ id: s.id, order: idx })));
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full mx-auto max-w-4xl bg-white text-black !pt-safe !px-safe overflow-hidden">
      <main className="relative flex flex-col flex-grow">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo.png" alt="Logo" className="w-40 h-auto" />
        </div>
        <Navbar />
        <Breadcrumb className="w-full max-w-4xl px-4 py-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/alert">Notifikace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Správa notifikací</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="ml-auto">
              <div className="flex gap-2">
                <Button size="sm" className="px-2 text-[9px]" onClick={openAdd}>
                  Přidat notifikaci
                </Button>
                <Button
                  size="sm"
                  className="px-2 text-[9px]"
                  variant="destructive"
                  onClick={() => resetAlerts()}
                  disabled={isResetting}
                >
                  {isResetting ? "Resetuji…" : "Reset výchozí"}
                </Button>
              </div>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="px-4 pb-4 max-w-lg space-y-4 mx-auto overflow-auto h-full">
          {isLoading && <Spinner />}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedAlerts.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedAlerts.map((alert) => (
                  <SortableItem key={alert.id} svc={alert}>
                    <div
                      className={cn(
                        "group relative aspect-square rounded-3xl bg-gradient-to-br shadow-xl hover:scale-105 hover:shadow-2xl active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-sm",
                        alert.className
                      )}
                      style={{ backgroundColor: alert.className }}
                    >
                      <div className="absolute inset-0 bg-black/20 rounded-3xl" />
                      <div className="relative h-full flex flex-col items-center justify-center space-y-2 p-3 pb-0.5">
                        <div className="text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {
                            availableIcons.find((i) => i.name === alert.icon)
                              ?.icon
                          }
                        </div>
                        <span className="text-xs font-semibold text-center text-white drop-shadow-lg leading-tight whitespace-pre-line">
                          {alert.label}
                        </span>
                        <Button
                          className="relative"
                          size="sm"
                          onClick={() => openEdit(alert)}
                        >
                          Upravit
                        </Button>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
          <Dialog
            open={editing !== null}
            onOpenChange={(o) => !o && setEditing(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isNew ? "Přidat notifikaci" : "Upravit notifikaci"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Název</Label>
                  <Input
                    value={form.label}
                    maxLength={20}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, label: e.target.value }))
                    }
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {form.label.length}/20 znaků
                  </div>
                </div>
                <div>
                  <Label>Ikona</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {availableIcons.map(({ name, icon }) => {
                      const isSelected = form.icon === name;
                      return (
                        <button
                          key={name}
                          onClick={() => setForm((f) => ({ ...f, icon: name }))}
                          className={`flex items-center justify-center p-2 border rounded ${
                            isSelected
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>Barva</Label>
                  <Input
                    type="color"
                    className={cn(
                      `bg-gradient-to-br backdrop-blur-sm`,
                      form.className
                    )}
                    value={
                      form.className.includes(" ") ? "#ffffff" : form.className }
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        className: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter className="justify-between flex-row">
                <Button variant="secondary" onClick={() => setEditing(null)}>
                  Zrušit
                </Button>
                {!isNew && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(editing!.id)}
                  >
                    Smazat
                  </Button>
                )}
                <Button onClick={submit}>Uložit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
