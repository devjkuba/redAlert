import Navbar from "@/components/Navbar";
import { Ambulance, Flame, Shield, Phone, MessageCircle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
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

export default function RescueTeams() {
  const { isDemoActive } = useDemo();
  const [coordinates, setCoordinates] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getLocation();
      if (location) {
        setCoordinates(`${location.latitude}° N, ${location.longitude}° E`);
      }
    };
    fetchLocation();
  }, []);

  const emergencyNumbers = [
    {
      icon: <Shield className="text-blue-500 w-8 h-8" />,
      label: "Policie ČR",
      number: "158",
      hasSms: true,
      id: 1,
    },
    {
      icon: <Ambulance className="text-red-500 w-10 h-10" />,
      label: "Zdravotnická záchranná služba",
      number: "155",
      hasSms: false,
      id: 2,
    },
    {
      icon: <Flame className="text-yellow-500 w-10 h-10" />,
      label: "Hasičský záchranný sbor ČR",
      number: "150",
      hasSms: true,
      id: 3,
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe mb-safe mx-auto max-w-4xl w-full">
        <main className="relative flex flex-col flex-grow">
          {isDemoActive && (
            <div className="absolute bg-[#982121] text-white font-sm w-full text-center font-bold text-sm">
              DEMO
            </div>
          )}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
            <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-2" />
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
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>Záchranné složky</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="w-full px-4 mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyNumbers.map((emergency) => (
              <Card key={emergency.id} className="shadow-lg border border-gray-300 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-0">
                  <CardTitle className="text-lg">{emergency.label}</CardTitle>
                  {emergency.icon}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between w-full px-2">
                    <div className="flex items-center gap-3">
                      <Phone className="w-6 h-6 text-sky-600" />
                      <span className="text-3xl font-semibold text-gray-900">
                        {emergency.number}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-4 px-2">
                    {emergency.hasSms && <Button
                      onClick={() => {
                        if (!isDemoActive) {
                          window.location.href = `sms:${emergency.number}?body=Potřebuji%20pomoc!%20Aktivní%20útočník!%20Moje%20GPS%20poloha:%20${coordinates}.%20Nemohu%20mluvit.%20Odesláno%20z%20Red%20Alert.`;
                        } else {
                          window.alert(
                            "Demo režim je aktivní. Nelze vytvořit sms."
                          );
                        }
                      }}
                      className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      <span>SMS</span>
                    </Button>}
                    <Button
                      onClick={() => {
                        if (!isDemoActive) {
                          window.location.href = `tel:${emergency.number}`;
                        } else {
                          window.alert(
                            "Demo režim je aktivní. Nelze provést hovor."
                          );
                        }
                      }}
                      className="flex items-center bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      <span>Zavolat</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
    </div>
  );
}
