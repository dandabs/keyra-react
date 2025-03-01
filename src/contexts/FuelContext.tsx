import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { getFuelPriceByTag } from '../fuelStationSources';
import { notify } from '../notificationUtils';
import { formatCurrency } from '../utils';
import { apiAxiosClient } from '../axios';

interface FuelContextProps {
    fuelPrice: number;
    setFuelPrice: (price: number) => void;
    fuelCurrency: string;
    setFuelCurrency: (currency: string) => void;
    fuelSyncStation: string | null;
    setFuelSyncStationId: (id: string) => void;
}

const FuelContext = createContext<FuelContextProps | null>(null);

interface FuelProviderProps {
    children: ReactNode;
}

const FuelProvider = ({ children }: FuelProviderProps) => {
    const [fuelPrice, setFuelPriceState] = useState(0);
    const [fuelCurrency, setFuelCurrencyState] = useState("ISK");
    const [fuelSyncStation, setFuelSyncStation] = useState<string | null>(null);

    const isCalledRef = React.useRef(false);

    async function setFuelCurrency(currency: string) {
        await Preferences.set({ key: 'fuelCurrency', value: currency });
        setFuelCurrencyState(currency);

        await Preferences.remove({ key: 'fuelSyncStation' });
        setFuelSyncStation(null);
    }

    async function setFuelPrice(price: number) {
        await Preferences.set({ key: 'fuelPrice', value: price.toString() });
        setFuelPriceState(price);
    }

    async function setFuelSyncStationId(id: string) {
        await Preferences.set({ key: 'fuelSyncStation', value: id });
        setFuelSyncStation(id);
    }

    async function getData() {
        const fuelCurrency = await Preferences.get({ key: 'fuelCurrency' });
        if (fuelCurrency.value) setFuelCurrencyState(fuelCurrency.value);
        if (!fuelCurrency.value) {
            const drives = await apiAxiosClient.get('/drives');
            if (drives.data.length > 0) {
                setFuelCurrency(drives.data[0].fuel.currency);
            }
        }

        const fuelPrice = await Preferences.get({ key: 'fuelPrice' });
        if (fuelPrice.value) setFuelPriceState(parseFloat(fuelPrice.value));

        const fuelSyncStation = await Preferences.get({ key: 'fuelSyncStation' });
        if (fuelSyncStation.value) {
            setFuelSyncStation(fuelSyncStation.value);
            const newFuelPrice = await getFuelPriceByTag(fuelSyncStation.value);
            if (fuelPrice.value && newFuelPrice < parseFloat(fuelPrice.value)) {
                notify(`Fuel price changed`, `The fuel price at your synced station has changed from ${formatCurrency(parseFloat(fuelPrice.value), fuelCurrency.value || 'ISK')} to ${formatCurrency(newFuelPrice, fuelCurrency.value || 'ISK')}`);
            }
            setFuelPrice(newFuelPrice);
        }

        isCalledRef.current = false;
    }

    useEffect(() => {
        if (!isCalledRef.current) {
            isCalledRef.current = true;
            getData();
        }
    }, []);

    return (
        <FuelContext.Provider value={{ fuelPrice, setFuelPrice, fuelCurrency, setFuelCurrency, fuelSyncStation, setFuelSyncStationId }}>
            { children }
        </FuelContext.Provider>
    )
}

const useFuel = () => {
    return useContext(FuelContext);
}

export { FuelProvider, useFuel };
