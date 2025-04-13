import Navbar from "@/components/Navbar";
import useUser from "@/hooks/useUser";
import { Button } from "@/components/ui/button"; // Pokud používáš komponenty jako shadcn/ui
import useDemo from "@/hooks/useDemo";

export default function Settings() {
  const { user } = useUser();
  const isAdmin = user?.role === "ADMIN";
  const { isDemoActive, toggleDemo } = useDemo();

  return (
    <div className="flex min-h-screen !pt-safe !px-safe pb-safe">
      <main className="relative overflow-hidden flex flex-col flex-grow items-center justify-start">
        {isDemoActive && (
          <div className="absolute bg-[#d62a70] text-white font-sm w-full text-center font-bold text-sm">
            DEMO
          </div>
        )}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-2" />
        </div>
        <Navbar />
        {isAdmin && (
          <div className="mt-4 flex flex-col items-center">
            <p className="mb-4 text-lg font-semibold text-gray-800">
              Demo režim je {isDemoActive ? "aktivní" : "neaktivní"}
            </p>
            <Button
              onClick={toggleDemo}
              className={isDemoActive ? "bg-[#d62a70] hover:bg-red-600" : ""}
            >
              {isDemoActive ? "Deaktivovat demo" : "Aktivovat demo"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
