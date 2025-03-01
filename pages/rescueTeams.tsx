import Navbar from "@/components/Navbar";
import { Ambulance, Flame, Shield, Phone, MessageCircle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { getLocation } from "@/hooks/getLocation";

export default function RescueTeams() {
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
    <div className="bg-black min-h-screen relative overflow-hidden !pt-safe !px-safe pb-safe">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute left-1/2 top-[100%] md:max-w-[200px] -translate-x-1/2 -translate-y-1/2 scale-[2] filter hue-rotate-[100deg] brightness-[80%] contrast-[120%]"
      >
        <source src="/background.mp4" type="video/mp4" />
        Vaš prohlížeč nepodporuje video.
      </video>
      <main className="relative flex flex-col flex-grow">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo-white.png" alt="Logo" className="w-48 h-auto mb-2" />
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
          <h2 className="text-white text-xl font-semibold mb-4">
            Kontakty na záchranné složky
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyNumbers.map((emergency) => (
              <div
                key={emergency.id}
                className="group flex flex-col items-center p-4 border border-gray-700 rounded-md bg-gray-900 hover:bg-gray-800 transition-transform transform hover:scale-105 shadow-md mx-auto w-[80%] max-w-[80%]"
              >
                <div className="flex items-center w-full">
                  {emergency.icon}
                  <div className="flex flex-col ml-4">
                    <span className="text-sm font-semibold text-white">
                      {emergency.label}
                    </span>
                    <span className="text-3xl font-bold text-gray-300 group-hover:text-blue-400">
                      {emergency.number}
                    </span>
                  </div>
                </div>
                <div className="flex mt-4 space-x-4">
                    <a
                        href={`sms:${emergency.number}?body=Potřebuji%20pomoc!%20Aktivní%20útočník!%20Moje%20GPS%20poloha:%20${coordinates}.%20Nemohu%20mluvit.%20Odesláno%20z%20Red%20Alert.`}
                        className="group flex items-center text-white p-2 rounded-md bg-yellow-500 hover:bg-yellow-600 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-white group-hover:text-green-400" />
                      <span className="ml-2">SMS</span>
                    </a>
                  <a
                    href={`tel:${emergency.number}`}
                    className="group flex items-center text-white p-2 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-white group-hover:text-green-400" />
                    <span className="ml-2">Zavolat</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
