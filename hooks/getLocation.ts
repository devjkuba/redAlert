import { Capacitor } from "@capacitor/core";

type Location = {
  latitude: number;
  longitude: number;
};

const geoOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0  
};

const LOCATION_PERMISSION_KEY = "location_permission_granted";

export const getLocation = async (): Promise<Location | null> => {
  try {
    const isNative = Capacitor.isNativePlatform();
    const previouslyGranted = localStorage.getItem(LOCATION_PERMISSION_KEY);

    if (previouslyGranted === "false") {
      console.warn("Uživatel dříve odmítl sdílení polohy.");
      return null;
    }

    if (isNative) {
      const { Geolocation } = await import("@capacitor/geolocation");
      const position = await Geolocation.getCurrentPosition(geoOptions);
      localStorage.setItem(LOCATION_PERMISSION_KEY, "true");
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } else if ("geolocation" in navigator) {
      const permissionStatus = await navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .catch(() => null);

      if (permissionStatus?.state === "denied") {
        console.warn("Přístup k poloze byl odmítnut v oprávněních prohlížeče.");
        localStorage.setItem(LOCATION_PERMISSION_KEY, "false");
        return null;
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            localStorage.setItem(LOCATION_PERMISSION_KEY, "true");
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Chyba při získávání polohy:", error);
            localStorage.setItem(LOCATION_PERMISSION_KEY, "false");
            reject(null);
          },
          geoOptions
        );
      });
    } else {
      console.warn("Geolokace není v tomto prostředí podporována.");
      return null;
    }
  } catch (error) {
    console.error("Neočekávaná chyba při získávání polohy:", error);
    return null;
  }
};


export const watchLocation = async (
  onUpdate: (location: Location) => void,
  onError?: (error: unknown) => void
): Promise<() => void> => {
  try {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const { Geolocation } = await import("@capacitor/geolocation");

      const watchId = await Geolocation.watchPosition(geoOptions, (position, error) => {
        if (error) {
          console.error("Capacitor Geolocation watch error:", error);
          onError?.(error);
          return;
        }
        if (position) {
          onUpdate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      });

      return () => {
        Geolocation.clearWatch({ id: watchId }).catch((error) => {
          console.error("Error clearing watch:", error);
        });
      };
    } else if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          onUpdate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Browser geolocation watch error:", error);
          onError?.(error);
        },
        geoOptions
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      console.warn("Geolocation not supported in this environment.");
      return () => {};
    }
  } catch (error: unknown) {
    console.error("Unexpected error while watching location:", error);
    onError?.(error);
    return () => {};
  }
};
