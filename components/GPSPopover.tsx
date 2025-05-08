import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Copy, Share, RefreshCw } from "lucide-react";
import { getLocation, watchLocation } from "@/hooks/getLocation";
import { Spinner } from "@/components/ui/spinner";

export default function GPSPopover() {
  const [coordinates, setCoordinates] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stopWatching: (() => void) | null = null;

    const initLocation = async () => {
      setLoading(true);
      const location = await getLocation();
      if (location) {
        setCoordinates(
          `<span class="text-[10px]">${location.latitude}° N</span> <span class="text-[10px]">${location.longitude}° E</span>`
        );
      }
      setLoading(false);
    };

    initLocation();

    const startWatching = async () => {
      stopWatching = await watchLocation(
        (loc) => {
          setCoordinates(
            `<span class="text-[10px]">${loc.latitude}° N</span> <span class="text-[10px]">${loc.longitude}° E</span>`
          );
        },
        (error) => {
          console.error("Chyba při sledování polohy:", error);
        }
      );
    };

    startWatching();

    return () => {
      stopWatching?.();
    };
  }, []);

  const copyToClipboard = () => {
    if (coordinates) {
      navigator.clipboard.writeText(coordinates.replace(/<[^>]+>/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareCoordinates = async () => {
    if (navigator.share && coordinates) {
      try {
        await navigator.share({
          title: "GPS Souřadnice",
          text: `GPS: ${coordinates.replace(/<[^>]+>/g, "")}`,
        });
      } catch (error) {
        console.error("Chyba při sdílení:", error);
      }
    } else {
      alert("Sdílení není v tomto prohlížeči podporováno.");
    }
  };

  const refreshCoordinates = async () => {
    setLoading(true);
    const location = await getLocation();
    if (location) {
      setCoordinates(
        `<span class="text-[10px]">${location.latitude}° N</span> <span class="text-[10px]">${location.longitude}° E</span>`
      );
    }
    setLoading(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="border border-gray-300 mx-auto shadow-lg border-black py-2 px-4 rounded-lg inline-block cursor-pointer">
          <p className="flex items-center space-x-2 text-sm">
            <span className="font-semibold">GPS:</span>
            {(() => {
              let content;
              if (loading) {
                content = <Spinner size="sm" className="bg-black float-right ml-2.5 mt-[5px]" />;
              } else if (coordinates) {
                content = (
                  <span
                    className="text-gray-700 truncate flex flex-col leading-[1.1]"
                    dangerouslySetInnerHTML={{ __html: coordinates }}
                  />
                );
              } else {
                content = <span className="text-gray-500 text-xs">Neznámé souřadnice</span>;
              }
              return content;
            })()}
          </p>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <div className="flex flex-col gap-4">
          <h4 className="font-medium leading-none">Sdílení souřadnic</h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={shareCoordinates}
              className="flex items-center gap-2"
              disabled={!coordinates}
            >
              <Share size={16} /> Sdílet
            </Button>
            <Button
              onClick={copyToClipboard}
              className="flex items-center gap-2"
              disabled={!coordinates}
            >
              <Copy size={16} /> {copied ? "Zkopírováno!" : "Kopírovat"}
            </Button>
            <Button
              onClick={refreshCoordinates}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} /> Obnovit
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
