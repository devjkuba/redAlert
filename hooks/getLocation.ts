import { Capacitor } from "@capacitor/core";

type Location = {
  latitude: number;
  longitude: number;
};

const geoOptions = {
  enableHighAccuracy: true,
  timeout: 10000,      // 10 sekund
  maximumAge: 0        // žádná cache
};

export const getLocation = async (): Promise<Location | null> => {
  try {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const { Geolocation } = await import("@capacitor/geolocation");
      const position = await Geolocation.getCurrentPosition(geoOptions);
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } else if ("geolocation" in navigator) {
      const permissionStatus = await navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .catch(() => null);

      if (permissionStatus?.state === "denied") {
        console.warn("Permission for geolocation was denied.");
        return null;
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Geolocation error:", error);
            reject(null);
          },
          geoOptions
        );
      });
    } else {
      console.warn("Geolocation not supported in this environment.");
      return null;
    }
  } catch (error: unknown) {
    console.error("Unexpected error while getting location:", error);
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

      return async () => {
        await Geolocation.clearWatch({ id: watchId });
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
