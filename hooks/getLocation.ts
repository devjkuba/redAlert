import { Capacitor } from '@capacitor/core';

export const getLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
        if ((window as { Capacitor?: typeof Capacitor }).Capacitor && (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android')) {
            const { Geolocation } = await import('@capacitor/geolocation');
            const position = await Geolocation.getCurrentPosition();
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
        } else {
            if (navigator.geolocation) {
                return new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition((position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    }, (error) => {
                        console.error('Geolocation error:', error);
                        reject(null);
                    });
                });
            } else {
                console.log('Geolocation not supported in this browser.');
                return null;
            }
        }
    } catch (error) {
        console.error('Error getting location:', error);
        return null;
    }
};