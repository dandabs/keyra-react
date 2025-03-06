import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { getFuelPriceByTag } from '../fuelStationSources';
import { notify } from '../notificationUtils';
import { formatCurrency } from '../utils';
import { apiAxiosClient } from '../axios';

interface FuelContextProps {
    fuelSyncStation: string | null;
    setFuelSyncStationId: (id: string) => void;
}

const FuelContext = createContext<FuelContextProps | null>(null);

interface FuelProviderProps {
    children: ReactNode;
}

const FuelProvider = ({ children }: FuelProviderProps) => {
    const [fuelSyncStation, setFuelSyncStation] = useState<string | null>(null);

    const isCalledRef = React.useRef(false);

    async function setFuelSyncStationId(id: string) {
        await Preferences.set({ key: 'fuelSyncStation', value: id });
        setFuelSyncStation(id);
    }

    async function getData() {
        const fuelSyncStation = await Preferences.get({ key: 'fuelSyncStation' });
        if (fuelSyncStation.value) {
            try {
                setFuelSyncStation(fuelSyncStation.value);
                // const newFuelPrice = await getFuelPriceByTag(fuelSyncStation.value);
                // if (fuelPrice.value && parseFloat(newFuelPrice) < parseFloat(fuelPrice.value)) {
                //     notify(`Fuel price changed`, `The fuel price at your synced station has changed from ${formatCurrency(parseFloat(fuelPrice.value), fuelCurrency.value || 'ISK')} to ${formatCurrency(newFuelPrice, fuelCurrency.value || 'ISK')}`);
                // }
                // setFuelPrice(newFuelPrice);
            } catch (e) {
                await Preferences.remove({ key: 'fuelSyncStation' });
                notify(`Fuel syncing stopped`, `Your synced fuel station doesn't appear to exist in our records anymore`);
            }
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
        <FuelContext.Provider value={{ fuelSyncStation, setFuelSyncStationId }}>
            { children }
        </FuelContext.Provider>
    )
}

const useFuel = () => {
    return useContext(FuelContext);
}

export { FuelProvider, useFuel };
