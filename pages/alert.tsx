import GPSPopover from "@/components/GPSPopover";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { toast } from "sonner";

export default function Alert() {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    if (!active) {
      toast.error("Poplach byl aktivován.", {
        duration: 5000, // Délka zobrazení toastu
        classNames: {
          toast:
            "!bg-red-100 border-l-4 !border-red-500 !text-red-700 p-4 shadow-lg rounded-lg",
          title: "font-bold text-red-700",
          description: "text-red-600",
          icon: "text-red-500",
          closeButton: "text-red-500 hover:text-red-700",
        },
      });
    } else {
      toast.success("Poplach byl vypnut.", {
        duration: 5000, // Délka zobrazení toastu
        classNames: {
          toast:
            "!bg-green-100 border-l-4 !border-green-500 !text-green-700 p-4 shadow-lg rounded-lg",
          title: "font-bold !text-green-700",
          description: "!text-green-600",
          icon: "!text-green-500",
          closeButton: "!text-green-500 !hover:text-green-700",
        },
      });
    }
    setActive((prevState) => !prevState);
  };

  return (
    <div className="bg-black min-h-screen relative overflow-hidden">
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
        <GPSPopover />
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
<div className="absolute top-[calc(50vh-100px)] md:top-[calc(50vh-30px)] left-1/2 -translate-x-1/2 flex flex-col items-center w-full space-y-4">
  <div className="relative">
    {/* Světlý odraz pod tlačítkem */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[220px] h-[220px] md:w-[170px] md:h-[170px] 
         bg-[#db0d5f] opacity-40 blur-3xl rounded-full"></div>

    <button
      onClick={handleClick}
      className={`relative w-[200px] h-[200px] md:w-[150px] md:h-[150px] text-white text-xl font-bold flex items-center justify-center
        !border-[15px] border-solid border-transparent rounded-full animate-borderMove 
        before:absolute before:inset-0 before:rounded-full before:border-[3px] before:border-white/20 before:pointer-events-none
        after:absolute after:inset-0 after:rounded-full after:border-[2px] after:border-white/10 after:pointer-events-none
        ${
          active
            ? "!bg-[#d62a70] scale-95 animate-ActiveMove shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]"
            : "scale-100 bg-transparent shadow-[0_4px_20px_rgba(219,13,95,0.5)]"
        }  
        transition-all duration-200 active:scale-90 active:shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]`}
    >
      {active ? "POPLACH" : "PŘIVOLAT"}
      <br />
      {active ? "AKTIVNÍ" : "POMOC"}
    </button>
  </div>
</div>


      </main>
    </div>
  );
}
