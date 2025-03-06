import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { initializeDatabase } from '../databaseHandler';
import { apiAxiosClient } from '../axios';
import BackgroundGeolocation, { Location, Subscription } from "@transistorsoft/capacitor-background-geolocation";
import { getToken } from '../cognitoConfig';
interface DriveContextProps {
    currentDrive: any | null;
    lastPoint: Location | null;
    getData: () => Promise<void>;
    setLastPoint: React.Dispatch<React.SetStateAction<Location | null>>
}

const DriveContext = createContext<DriveContextProps | null>(null);

interface DriveProviderProps {
    children: ReactNode;
}

const DriveProvider = ({ children }: DriveProviderProps) => {
    const [currentDrive, setCurrentDrive] = useState<any | null>(null);
    const [lastPoint, setLastPoint] = useState<Location | null>(null);

    const isCalledRef = React.useRef(false);

    async function getData() {
        const drive = await apiAxiosClient.get('/current-drive');
        setCurrentDrive(drive.data.drive);
    }

    async function initializeLocation() {
        BackgroundGeolocation.onLocation((location) => {
            setLastPoint(location);
            console.log(location);
        });

        BackgroundGeolocation.ready({
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
        distanceFilter: 10,
        stopTimeout: 5,
        debug: false,
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        stopOnTerminate: false,
        startOnBoot: true,
        url: apiAxiosClient.defaults.baseURL + '/location',
        headers: {
            "Authorization": `Bearer ${await getToken()}`
        },
        batchSync: true,
        maxBatchSize: 25,
        autoSync: true,
        autoSyncThreshold: 1,
        allowIdenticalLocations: true,
        }).then(async (state) => {
            console.log('Initialized location handler', state);
            console.log('Starting location handler');
            await BackgroundGeolocation.start();
            console.log('Started location handler');
        });
    }

    useEffect(() => {
        if (isCalledRef.current) return;
        isCalledRef.current = true;

        getData();
        initializeDatabase();

        initializeLocation();
    }, []);

    return (
        <DriveContext.Provider value={{ currentDrive, lastPoint, getData, setLastPoint }}>
            { children }
        </DriveContext.Provider>
    )
}

const useDrive = () => {
    return useContext(DriveContext);
}

export { DriveProvider, useDrive };
