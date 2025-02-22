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
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <img src="/logo-white.png" alt="Logo" className="w-48 h-auto" />
        </div>
        <Navbar />
        <div className="absolute top-[calc(50vh-90px)] left-1/2 -translate-x-1/2 flex justify-center items-center w-full">
          <button
            onClick={handleClick}
            className="w-[200px] h-[200px] text-white text-xl font-bold flex items-center justify-center 
          border-8 border-solid border-transparent 
          bg-transparent animate-borderMove"
          >
            {active ? 'Jsem' : 'PŘIVOLAT'}<br />
            {active ? 'v bezpečí' : 'POMOC'}
          </button>
        </div>
      </main>
    </div>
  );
}
