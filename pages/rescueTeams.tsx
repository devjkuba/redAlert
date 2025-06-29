import Navbar from "@/components/Navbar";
import {
  Phone,
  MessageCircle,
  Shield,
  Flame,
  Ambulance,
  PhoneCall,
  Trash,
  AlertTriangle,
  LifeBuoy,
  Bell,
  Crosshair,
  MapPin,
  ShieldAlert,
  SquarePen,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { cloneElement, useEffect, useState } from "react";
import { getLocation } from "@/hooks/getLocation";
import { Button } from "@/components/ui/button";
import useDemo from "@/hooks/useDemo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import useUser from "@/hooks/useUser";
import {
  EmergencyServiceData,
  useEmergencyServices,
} from "@/hooks/useEmergencyServices";
import useAuthToken from "@/hooks/useAuthToken";
import { Spinner } from "@/components/ui/spinner";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem";

const iconMap: Record<string, JSX.Element> = {
  Shield: <Shield />,
  Flame: <Flame />,
  Ambulance: <Ambulance />,
  PhoneCall: <PhoneCall />,
};

const availableIcons: { name: string; icon: JSX.Element }[] = [
  { name: "Shield", icon: <Shield /> },
  { name: "Flame", icon: <Flame /> },
  { name: "Ambulance", icon: <Ambulance /> },
  { name: "PhoneCall", icon: <PhoneCall /> },
  { name: "AlertTriangle", icon: <AlertTriangle /> },
  { name: "LifeBuoy", icon: <LifeBuoy /> },
  { name: "Bell", icon: <Bell /> },
  { name: "Crosshair", icon: <Crosshair /> },
  { name: "MapPin", icon: <MapPin /> },
  { name: "StarOfLife", icon: <ShieldAlert /> },
];

export default function RescueTeams() {
  const { isDemoActive } = useDemo();
  const token = useAuthToken();
  const { data: user } = useUser();

  const userOrgId = user?.organizationId;
  const {
    services,
    isLoading,
    isError,
    isResetting,
    addService,
    editService,
    removeService,
    reorderServices,
    resetServices,
  } = useEmergencyServices(userOrgId ?? 0, token);

  const [sortedServices, setSortedServices] = useState<EmergencyServiceData[]>(
    []
  );
  useEffect(() => {
    if (services) setSortedServices(services);
  }, [services]);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const [coordinates, setCoordinates] = useState<string | null>(null);

  const [editingSvc, setEditingSvc] = useState<EmergencyServiceData | null>(
    null
  );
  const isNew = editingSvc !== null && !("id" in editingSvc);
  const [form, setForm] = useState({
    label: "",
    number: "",
    icon: "Shield",
    iconColor: "#000000",
    hasSms: false,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getLocation();
      if (location) {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
        setCoordinates(`${location.latitude}° N, ${location.longitude}° E`);
      }
    };
    fetchLocation();
  }, []);

  const openAdd = () => {
    setEditingSvc({
      label: "",
      number: "",
      icon: "Shield",
      iconColor: "#000000",
      hasSms: false,
    } as EmergencyServiceData);
    setForm({
      label: "",
      number: "",
      icon: "Shield",
      iconColor: "#000000",
      hasSms: false,
    });
  };

  const openEdit = (svc: EmergencyServiceData) => {
    setEditingSvc(svc);
    setForm({
      label: svc.label,
      number: svc.number,
      icon: svc.icon,
      iconColor: svc.iconColor ?? "#000000",
      hasSms: svc.hasSms,
    });
  };

  const submit = () => {
    const payload = {
      ...form,
      name: form.label,
      phone: form.number,
      id: 0,
      organizationId: userOrgId ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0,
    };
    if (isNew) {
      addService(payload, {
        onSuccess: () => setEditingSvc(null),
        onError: console.error,
      });
    } else if (editingSvc) {
      editService(
        { id: editingSvc.id, data: payload },
        { onSuccess: () => setEditingSvc(null), onError: console.error }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Opravdu smazat tuto službu?")) {
      removeService(id, { onError: console.error });
      setEditingSvc(null);
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

  const sensors = useSensors(
    mouseSensor,
    touchSensor
  );

  interface DragEndEvent {
    active: { id: number | string };
    over: { id: number | string } | null;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sortedServices.findIndex(
        (s) => s.id === Number(active.id)
      );
      const newIndex = sortedServices.findIndex(
        (s) => s.id === Number(over?.id)
      );
      const items = [...sortedServices];
      const [moved] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, moved);
      setSortedServices(items); // optimistic update without flicker
      reorderServices(
        items.map((s, idx) => ({ id: s.id, order: idx })),
        { onError: () => setSortedServices(services || []) }
      );
    }
  };

  return (
    <div className="flex h-[calc(100vh_-_29px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe mx-auto max-w-4xl w-full">
      <main className="relative flex flex-col flex-grow">
        {isDemoActive && (
          <div className="absolute bg-[#982121] text-white font-sm w-full text-center font-bold text-sm">
            DEMO
          </div>
        )}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo.png" alt="Logo" className="w-40 h-auto" />
        </div>
        <Navbar />
        <Toaster
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast: "border-l-4 p-4 shadow-lg rounded-lg",
              title: "font-bold",
              description: "text-red-600",
            },
          }}
        />
        <Breadcrumb className="w-full max-w-4xl px-4 py-2">
          <BreadcrumbList className="justify-between">
            <BreadcrumbItem>
              <BreadcrumbLink>Záchranné složky</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="px-2 text-[9px]"
                    onClick={openAdd}
                  >
                    Přidat kontakt
                  </Button>
                  <Button
                    size="sm"
                    className="px-2 text-[9px]"
                    variant="destructive"
                    onClick={() => resetServices()}
                    disabled={isResetting}
                  >
                    {isResetting ? "Resetuji…" : "Reset výchozí"}
                  </Button>
                </div>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {isAdmin ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedServices.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="w-full px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto overscroll-none max-h-[calc(100vh_-_145px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]">
                {isError && <div>Chyba při načítání.</div>}
                {isLoading && (
                  <Spinner size="lg" className="ml-auto mr-auto mt-4" />
                )}
                {sortedServices?.map((svc) => (
                  <SortableItem key={svc.id} svc={svc}>
                    <Card
                      key={svc.id}
                      className="cursor-grab active:cursor-grabbing rounded-3xl border border-grey/20 bg-[#f8f8f8] shadow-none relative"
                    >
                      <CardHeader className="flex flex-row items-center justify-between !p-4 !pb-0">
                        <CardTitle className="text-md !pb-0 gap-[7px] flex items-center">
                          {svc.icon && iconMap[svc.icon]
                            ? cloneElement(iconMap[svc.icon], {
                                className: "w-5 h-5",
                                color: svc.iconColor ?? "#000",
                              })
                            : null}
                          {svc.label}
                        </CardTitle>

                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-semibold text-gray-900">
                            {svc.number}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4 !p-4 flex-row justify-between">
                        <div className="flex flex-row gap-2 px-1">
                          {svc.hasSms && (
                            <Button
                              onClick={() => {
                                if (!isDemoActive) {
                                  const org = user?.organization;
                                  let address = "";
                                  if (org?.street) address += `, ${org.street}`;
                                  if (org?.city) address += `, ${org.city}`;
                                  const mapLink =
                                    latitude && longitude
                                      ? `https://maps.google.com/?q=${latitude},${longitude}`
                                      : "";

                                  window.location.href = `sms:${
                                    svc.number
                                  }?body=Potřebuji%20pomoc!%20Moje%20GPS%20poloha:%20${coordinates}%20${mapLink}.%20Nemohu%20mluvit.%20Organizace:%20${
                                    org?.name ?? ""
                                  }${address}. Odesláno%20z%20aplikace%20Red%20Alert.`;
                                } else {
                                  window.alert(
                                    "Demo režim je aktivní. Nelze vytvořit sms."
                                  );
                                }
                              }}
                              className="flex gap-0 items-center rounded-3xl bg-gradient-to-br hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-sm from-green-600 to-green-700"
                            >
                              <MessageCircle className="w-5 h-5 mr-2" />
                              <span>SMS</span>
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              if (!isDemoActive) {
                                window.location.href = `tel:${svc.number}`;
                              } else {
                                window.alert(
                                  "Demo režim je aktivní. Nelze provést hovor."
                                );
                              }
                            }}
                            className="flex gap-0 items-center rounded-3xl bg-gradient-to-br hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-sm from-sky-600 to-sky-700"
                          >
                            <Phone className="w-5 h-5 mr-2" />
                            <span>Zavolat</span>
                          </Button>
                        </div>
                        <div className="flex items-center">
                          <button onClick={() => openEdit(svc)}>
                            <SquarePen className="w-5 h-5" color="#2563EB" />
                          </button>
                          {/* <button onClick={() => handleDelete(svc.id)}>
                                <Trash className="w-5 h-5 text-red-600" />
                              </button> */}
                        </div>
                      </CardContent>
                    </Card>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="w-full px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto overscroll-none max-h-[calc(100vh_-_145px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]">
            {isError && <div>Chyba při načítání.</div>}
            {isLoading && (
              <Spinner size="lg" className="ml-auto mr-auto mt-4" />
            )}
            {sortedServices?.map((svc) => (
              <SortableItem key={svc.id} svc={svc}>
                <Card
                  key={svc.id}
                  className="rounded-3xl border border-grey/20 bg-[#f8f8f8] shadow-none relative"
                >
                  <CardHeader className="flex flex-row items-center justify-between !p-4 !pb-0">
                    <CardTitle className="text-md !pb-0 gap-[7px] flex items-center">
                      {svc.icon && iconMap[svc.icon]
                        ? cloneElement(iconMap[svc.icon], {
                            className: "w-5 h-5",
                            color: svc.iconColor ?? "#000",
                          })
                        : null}
                      {svc.label}
                    </CardTitle>

                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-semibold text-gray-900">
                        {svc.number}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 !p-4 flex-row justify-between">
                    <div className="flex flex-row gap-2 px-1">
                      {svc.hasSms && (
                        <Button
                          onClick={() => {
                            if (!isDemoActive) {
                              const org = user?.organization;
                              let address = "";
                              if (org?.street) address += `, ${org.street}`;
                              if (org?.city) address += `, ${org.city}`;
                              const mapLink =
                                latitude && longitude
                                  ? `https://maps.google.com/?q=${latitude},${longitude}`
                                  : "";

                              window.location.href = `sms:${
                                svc.number
                              }?body=Potřebuji%20pomoc!%20Moje%20GPS%20poloha:%20${coordinates}%20${mapLink}.%20Nemohu%20mluvit.%20Organizace:%20${
                                org?.name ?? ""
                              }${address}. Odesláno%20z%20aplikace%20Red%20Alert.`;
                            } else {
                              window.alert(
                                "Demo režim je aktivní. Nelze vytvořit sms."
                              );
                            }
                          }}
                          className="flex gap-0 items-center rounded-3xl bg-gradient-to-br hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-sm from-green-600 to-green-700"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          <span>SMS</span>
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          if (!isDemoActive) {
                            window.location.href = `tel:${svc.number}`;
                          } else {
                            window.alert(
                              "Demo režim je aktivní. Nelze provést hovor."
                            );
                          }
                        }}
                        className="flex gap-0 items-center rounded-3xl bg-gradient-to-br hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-sm from-sky-600 to-sky-700"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        <span>Zavolat</span>
                      </Button>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center">
                        <button onClick={() => openEdit(svc)}>
                          <SquarePen className="w-5 h-5" color="#2563EB" />
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SortableItem>
            ))}
          </div>
        )}
        <Dialog
          open={editingSvc !== null}
          onOpenChange={(open) => !open && setEditingSvc(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isNew ? "Přidat kontakt" : "Upravit kontakt"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div>
                <Label>Popisek</Label>
                <Input
                  value={form.label}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, label: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Telefonní číslo</Label>
                <Input
                  value={form.number}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, number: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Ikona</Label>
                <div className="grid grid-cols-5 gap-2 p-1">
                  {availableIcons.map(({ name, icon }) => {
                    const isSelected = form.icon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, icon: name }))}
                        className={`flex items-center justify-center p-2 border rounded ${
                          isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {cloneElement(icon, {
                          className: "w-6 h-6",
                          color: form.iconColor || "#000000",
                          strokeWidth: isSelected ? 2 : 1,
                        })}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Barva ikony</Label>
                <Input
                  className="max-w-[50px]"
                  type="color"
                  value={form.iconColor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, iconColor: e.target.value }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.hasSms}
                  onCheckedChange={(val) =>
                    setForm((f) => ({ ...f, hasSms: !!val }))
                  }
                />
                <span>Podpora SMS</span>
              </label>
            </div>
            <DialogFooter className="justify-between flex-row">
              <Button variant="secondary" onClick={() => setEditingSvc(null)}>
                Zrušit
              </Button>
              {editingSvc && (
                <button
                  onClick={() => handleDelete(editingSvc.id)}
                  disabled={!editingSvc}
                >
                  <Trash className="w-5 h-5 text-red-600" />
                </button>
              )}
              <Button onClick={submit} disabled={isLoading}>
                {isNew
                  ? isLoading
                    ? "Přidávám…"
                    : "Přidat"
                  : isLoading
                  ? "Ukládám…"
                  : "Uložit změny"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
