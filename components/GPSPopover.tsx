import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Copy, MapPin, Share } from "lucide-react";
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="rounded-3xl px-4 py-2 border border-grey/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="p-3 bg-red-500/20 rounded-2xl">
                <MapPin className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm font-semibold">
                  Aktuální poloha
                </div>
                {(() => {
                  let content;
                  if (loading) {
                    content = (
                      <Spinner
                        size="sm"
                        className="bg-black float-right ml-2.5 mt-[5px]"
                      />
                    );
                  } else if (coordinates) {
                    content = (
                      <span
                        className="text-xs font-mono inline-block"
                        dangerouslySetInnerHTML={{
                          __html: coordinates ?? "",
                        }}
                      />
                    );
                  } else {
                    content = (
                      <span className="text-xs font-mono inline-block">
                        <span className="text-[10px]">Neznámé souřadnice</span>
                      </span>
                    );
                  }
                  return content;
                })()}
              </div>
              <div className="text-right">
              <div className="text-xs text-gray-400">Přesnost</div>
              <div className="text-sm font-semibold text-green-400">±3m</div>
            </div>
            </div>
          </div>
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
