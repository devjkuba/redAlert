import Navbar from "@/components/Navbar";
import { Ambulance, Flame, Shield, Phone, MessageCircle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { getLocation } from "@/hooks/getLocation";
import { Button } from "@/components/ui/button";
import useDemo from "@/hooks/useDemo";

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
      id: 1,
    },
    {
      icon: <Ambulance className="text-red-500 w-10 h-10" />,
      label: "Zdravotnická záchranná služba",
      number: "155",
      id: 2,
    },
    {
      icon: <Flame className="text-yellow-500 w-10 h-10" />,
      label: "Hasičský záchranný sbor ČR",
      number: "150",
      id: 3,
    },
  ];

  return (
    <div className="flex min-h-screen !pt-safe !px-safe pb-safe">
      <div className="border-0 mx-auto max-w-md w-full">
        <main className="relative flex flex-col flex-grow">
        {isDemoActive && (
          <div className="absolute bg-[#d62a70] text-white font-sm w-full text-center font-bold text-sm">
            DEMO
          </div>
        )}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
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
        <div className="flex flex-col items-center w-full space-y-6">
          <h2 className="text-xl font-semibold mb-4">
            Kontakty na záchranné složky
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {emergencyNumbers.map((emergency) => (
            <div
              key={emergency.id}
              className="flex flex-col items-center p-4 border border-gray-300 rounded-xl transition-transform transform hover:scale-105"
            >
              {emergency.icon}
              <div className="flex flex-col mt-4 text-center">
                <span className="text-sm font-semibold">{emergency.label}</span>
                <span className="text-3xl font-bold text-gray-600">
                  {emergency.number}
                </span>
              </div>
              <div className="flex mt-4 space-x-4">
                <Button
                  onClick={() => {
                    window.location.href = `sms:${emergency.number}?body=Potřebuji%20pomoc!%20Aktivní%20útočník!%20Moje%20GPS%20poloha:%20${coordinates}.%20Nemohu%20mluvit.%20Odesláno%20z%20Red%20Alert.`;
                  }}
                  className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white"
                >  <MessageCircle className="w-5 h-5 text-white" />
                  <span>SMS</span></Button>
                <Button
                  onClick={() => {
                    window.location.href = `tel:${emergency.number}`;
                  }}
                  className="flex items-center bg-sky-500 hover:bg-sky-600 text-white"
                >
                  <Phone className="w-5 h-5 text-white" />
                  <span>Zavolat</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        </div>
        </main>
      </div>
    </div>
  );
}
