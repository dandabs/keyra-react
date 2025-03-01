import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { apiAxiosClient } from '../axios';
import userPool from '../cognitoConfig';
import SetUsername from '../pages/Auth/SetUsername';
import { SplashScreen } from '@capacitor/splash-screen';

interface ProfileContextProps {
    numberSystem: string;
    setNumberSystem: (system: string) => void;
    yearStats: any | null;
    cars: any[] | null;
    refreshCars: () => void;
    defaultCar: string | null;
    setDefaultCar: (id: string) => void;
    attributes: any | null;
    updateAttributes: (attributes: { Name: string, Value: string}[]) => void;
    drives: any[] | null;
    refreshDrives: () => void;
}

const ProfileContext = createContext<ProfileContextProps | null>(null);

interface ProfileProviderProps {
    children: ReactNode;
}

const ProfileProvider = ({ children }: ProfileProviderProps) => {
    const [numberSystem, setNumberSystemState] = useState('metric');
    const [yearStats, setYearStats] = useState<any | null>(null);
    const [cars, setCars] = useState<any[] | null>(null);
    const [defaultCar, setDefaultCarState] = useState<string | null>(null);
    const [attributes, setAttributes] = useState<any | null>(null);
    const [drives, setDrives] = useState<any[] | null>(null);

    const isCalledRef = React.useRef(false);

    async function setDefaultCar(id: string) {
        await Preferences.set({ key: 'defaultCar', value: id });
        setDefaultCarState(id);
    }

    async function setNumberSystem(system: string) {
        await Preferences.set({ key: 'numberSystem', value: system });
        setNumberSystemState(system);
    }

    async function refreshYearStats() {
        const yearStats = await apiAxiosClient.get(`/stats/year/${new Date().getFullYear()}`);
        setYearStats(yearStats.data);
    }

    async function refreshCars() {
        const cars = await apiAxiosClient.get('/car');
        setCars(cars.data);

        const defaultCar = await Preferences.get({ key: 'defaultCar' });
        if (!defaultCar.value) {
            if (cars.data.length > 0) {
                await Preferences.set({ key: 'defaultCar', value: cars.data[0].PK });
                setDefaultCarState(cars.data[0].PK);
            }
        } else {
            if (!cars.data.find((car: any) => car.PK === defaultCar.value)) {
                if (cars.data.length > 0) {
                    await Preferences.set({ key: 'defaultCar', value: cars.data[0].PK });
                    setDefaultCarState(cars.data[0].PK);
                } else {
                    await Preferences.remove({ key: 'defaultCar' });
                    setDefaultCarState(null);
                }
            }
        }
    }

    async function refreshDrives() {
        const driveRes = await apiAxiosClient.get('/drives');
        setDrives(driveRes.data);
    }

    async function refreshAttributes() {
        const attributesData = await apiAxiosClient.get('/user');
        setAttributes(attributesData.data);
    }

    async function updateAttributes(attributes: { Name: string, Value: string}[]) {
        const cognitoUser = userPool.getCurrentUser();
        if (!cognitoUser) throw Error();

        await apiAxiosClient.put('/user', { attributes });

        await refreshAttributes();
    }

    async function getData() {
        const numberSystem = await Preferences.get({ key: 'numberSystem' });
        if (numberSystem.value) setNumberSystemState(numberSystem.value);

        const defaultCar = await Preferences.get({ key: 'defaultCar' });
        if (defaultCar.value) setDefaultCarState(defaultCar.value);

        await Promise.all([refreshYearStats(), refreshCars(), refreshAttributes(), refreshDrives()]);

        isCalledRef.current = false;
    }

    useEffect(() => {
        if (!isCalledRef.current) {
            isCalledRef.current = true;
            getData();
        }
    }, []);

    if (!attributes) return null;

    if (attributes)
        SplashScreen.hide();

    return (
        <ProfileContext.Provider value={{ numberSystem, setNumberSystem, yearStats, cars, refreshCars, defaultCar, setDefaultCar, attributes, updateAttributes, drives, refreshDrives }}>
            {
                !attributes.preferred_username ?
                <SetUsername />
                :
                children
            }
        </ProfileContext.Provider>
    )
}

const useProfile = () => {
    return useContext(ProfileContext);
}

export { ProfileProvider, useProfile };
