import Navbar from "@/components/Navbar";
import {
  Ambulance,
  Flame,
  Shield,
  Phone,
  MessageCircle,
  PhoneCall,
} from "lucide-react";
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
import useUser from "@/hooks/useUser";

export default function RescueTeams() {
  const { isDemoActive } = useDemo();
  const { data: user } = useUser();

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
      icon: <Shield className="text-blue-500 w-5 h-5 inline" />,
      label: "Policie ČR",
      number: "158",
      hasSms: true,
      id: 1,
    },
    {
      icon: <Ambulance className="text-red-500 w-5 h-5 inline" />,
      label: "Zdravotnická záchranná služba",
      number: "155",
      hasSms: false,
      id: 2,
    },
    {
      icon: <PhoneCall className="text-purple-600 w-5 h-5 inline" />,
      label: "Tísňová linka",
      number: "112",
      hasSms: true,
      id: 3,
    },
    {
      icon: <Flame className="text-yellow-500 w-5 h-5 inline" />,
      label: "Hasičský záchranný sbor ČR",
      number: "150",
      hasSms: true,
      id: 4,
    },
  ];

  return (
    <div className="flex h-[calc(100vh_-_29px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe mx-auto max-w-4xl w-full">
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
        <div className="w-full px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto overscroll-none max-h-[calc(100vh_-_145px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]">
          {emergencyNumbers.map((emergency) => (
            <Card
              key={emergency.id}
              className="shadow-lg border border-gray-300 rounded-xl"
            >
              <CardHeader className="flex flex-row items-center justify-between !p-4 !pb-0">
                <CardTitle className="text-md !pb-0 gap-[7px] flex items-center">
                  {emergency.icon} {emergency.label}
                </CardTitle>

                <div className="flex items-center space-x-2">
                  <span className="text-xl font-semibold text-gray-900">
                    {emergency.number}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 !p-4">
                <div className="flex flex-row gap-2 px-1">
                  {emergency.hasSms && (
                    <Button
                      onClick={() => {
                        if (!isDemoActive) {
                          const org = user?.organization;
                          let address = "";
                          if (org?.street) address += `, ${org.street}`;
                          if (org?.city) address += `, ${org.city}`;
                          window.location.href = `sms:${
                            emergency.number
                          }?body=Potřebuji%20pomoc!%20Moje%20GPS%20poloha:%20${coordinates}.%20Nemohu%20mluvit.%20Organizace:%20${
                            org?.name ?? ""
                          }${address}. Odesláno%20z%20aplikace%20Red%20Alert.`;
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
                    </Button>
                  )}
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
