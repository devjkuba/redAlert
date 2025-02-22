import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function Alert() {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(prevState => !prevState); 
  }

  return (
    <div className="bg-black min-h-screen relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute left-1/2 top-[100%] -translate-x-1/2 -translate-y-1/2 scale-[2] filter hue-rotate-[100deg] brightness-[80%] contrast-[120%]"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <main className="relative flex flex-col flex-grow">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo-white.png" alt="Logo" className="w-48 h-auto mb-2" />
        </div>
        <Navbar />
        <div className="border max-w-xs mx-auto mt-6 border-white text-white py-2 px-4 rounded-lg inline-block">
            <p>GPS: 48.1486° N, 17.1077° E</p>
          </div>
        <div className="absolute top-[calc(50vh-100px)] left-1/2 -translate-x-1/2 flex flex-col items-center w-full space-y-4">
          <button
            onClick={handleClick}
            className={`w-[200px] h-[200px] text-white text-xl font-bold flex items-center justify-center 
          !border-[15px] border-solid border-transparent rounded-[50%]
           ${active ? "!bg-[#d62a70] scale-95 animate-ActiveMove" : "scale-100"}  
          bg-transparent animate-borderMove`}
          >
            {active ? 'POPLACH' : 'PŘIVOLAT'}<br />
            {active ? 'AKTIVNÍ' : 'POMOC'}
          </button>
        </div>
      </main>
    </div>
  );
}
