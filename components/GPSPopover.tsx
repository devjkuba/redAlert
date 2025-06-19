import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Copy, MapPin, Share, Map } from "lucide-react";
import { getLocation, watchLocation } from "@/hooks/getLocation";
import { Spinner } from "@/components/ui/spinner";

export default function GPSPopover() {
  const [coordinates, setCoordinates] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stopWatching: (() => void) | null = null;

    const updateCoordinates = (lat: number, lng: number) => {
      setLatitude(lat);
      setLongitude(lng);
      setCoordinates(
        `<span class="text-[10px]">${lat.toFixed(
          6
        )}° N</span> <span class="text-[10px]">${lng.toFixed(6)}° E</span>`
      );
    };

    const initLocation = async () => {
      setLoading(true);
      const location = await getLocation();
      if (location) {
        updateCoordinates(location.latitude, location.longitude);
      }
      setLoading(false);
    };

    initLocation();

    const startWatching = async () => {
      stopWatching = await watchLocation(
        (loc) => {
          updateCoordinates(loc.latitude, loc.longitude);
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
    if (latitude !== null && longitude !== null) {
      navigator.clipboard.writeText(`${latitude}, ${longitude}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareCoordinates = async () => {
    if (navigator.share && latitude !== null && longitude !== null) {
      try {
        await navigator.share({
          title: "GPS Souřadnice",
          text: `GPS: ${latitude}, ${longitude}`,
          url: `https://maps.google.com/?q=${latitude},${longitude}`,
        });
      } catch (error) {
        console.error("Chyba při sdílení:", error);
      }
    } else {
      alert("Sdílení není v tomto prohlížeči podporováno.");
    }
  };

  const googleMapsLink =
    latitude !== null && longitude !== null
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="rounded-3xl cursor-pointer px-4 py-2 border border-grey/20 bg-[#f8f8f8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="p-3 bg-red-500/20 rounded-2xl">
                <MapPin className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm font-semibold">Aktuální poloha</div>
                {(() => {
                  if (loading) {
                    return (
                      <Spinner
                        size="sm"
                        className="bg-black float-right ml-2.5 mt-[5px]"
                      />
                    );
                  } else if (coordinates) {
                    return (
                      <span
                        className="text-xs font-mono inline-block"
                        dangerouslySetInnerHTML={{
                          __html: coordinates ?? "",
                        }}
                      />
                    );
                  } else {
                    return (
                      <span className="text-xs font-mono inline-block">
                        <span className="text-[10px]">Neznámé souřadnice</span>
                      </span>
                    );
                  }
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
              disabled={latitude === null || longitude === null}
            >
              <Share size={16} /> Sdílet
            </Button>
            <Button
              onClick={copyToClipboard}
              className="flex items-center gap-2"
              disabled={latitude === null || longitude === null}
            >
              <Copy size={16} /> {copied ? "Zkopírováno!" : "Kopírovat"}
            </Button>
          </div>
          {googleMapsLink && (
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm w-max self-center"
            >
              <Map size={16} /> Otevřít v Mapách
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
