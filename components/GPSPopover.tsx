import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Copy, Share } from "lucide-react";
import { getLocation } from "@/hooks/getLocation";
import { Spinner } from "@/components/ui/spinner";

export default function GPSPopover() {
  const [coordinates, setCoordinates] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getLocation();
      if (location) {
        setCoordinates(`${location.latitude}° N, ${location.longitude}° E`);
      }
    };
    fetchLocation();
  }, []);

  const copyToClipboard = () => {
    if (coordinates) {
      navigator.clipboard.writeText(coordinates);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareCoordinates = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "GPS Souřadnice",
          text: `GPS: ${coordinates}`,
        });
      } catch (error) {
        console.error("Chyba při sdílení:", error);
      }
    } else {
      alert("Sdílení není v tomto prohlížeči podporováno.");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="border max-w-xs mx-auto mt-6 md:mt-2 border-white text-white py-2 px-4 rounded-lg inline-block cursor-pointer">
        <p>
            GPS: {coordinates ? (
              <>{coordinates}</>
            ) : (
              <Spinner size="sm" className="bg-white float-right ml-2.5 mt-[5px]" />
            )}
          </p>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <div className="flex flex-col gap-4">
          <h4 className="font-medium leading-none">Sdílení souřadnic</h4>
          <div className="flex gap-2">
            <Button
              onClick={shareCoordinates}
              className="flex items-center gap-2"
            >
              <Share size={16} /> Sdílet
            </Button>
            <Button
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              <Copy size={16} /> {copied ? "Zkopírováno!" : "Kopírovat"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
