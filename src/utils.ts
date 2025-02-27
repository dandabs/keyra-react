import currencies from "./currencies";

export const haversine = (p1: any, p2: any) => {
    const R = 6371000; // Earth radius in meters
    const toRad = (deg: any) => deg * Math.PI / 180;
    const dLat = toRad(p2.latitude - p1.latitude);
    const dLon = toRad(p2.longitude - p1.longitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(p1.latitude)) * Math.cos(toRad(p2.latitude)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the Earth in km
    const toRadians = (degree: number) => degree * (Math.PI / 180);
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in km
}

export const formatCurrency = (value: number, currency: string) => {
    const c = currencies.find((c) => c.code === currency);
    if (!c) return value.toFixed(2);
    return c.format.replace(/%/g, value.toFixed(c.decimals));
};

export const mToKm = (m: number) => m / 1000;
export const mToMi = (m: number) => m / 1609.34;

export const msToKmh = (ms: number) => ms * 3.6;
export const msToMph = (ms: number) => ms * 2.23694;

export const msToM = (ms: number) => ms / 1000 / 60;
export const msToH = (ms: number) => ms / 3600000;

export const mToKmLabel = (m: number) => `${mToKm(m).toFixed(0)}km`;
export const mToMiLabel = (m: number) => `${mToMi(m).toFixed(0)}mi`;

export const msToKmhLabel = (ms: number) => `${msToKmh(ms).toFixed(0)}km/h`;
export const msToMphLabel = (ms: number) => `${msToMph(ms).toFixed(0)}mph`;

export const msToTimeLabel = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h${minutes}m`;
}
