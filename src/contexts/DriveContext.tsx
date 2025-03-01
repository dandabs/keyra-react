import { BackgroundGeolocationPlugin, Location } from 'cordova-background-geolocation-plugin';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { initializeDatabase } from '../databaseHandler';
import { initializeLocationHandler } from '../locationHandler';
import { handleLocationUpdate } from '../driveHandler';
import { Preferences } from '@capacitor/preferences';
import { apiAxiosClient } from '../axios';

declare const BackgroundGeolocation: BackgroundGeolocationPlugin;

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
        setCurrentDrive(null);
    }

    function getLastPoint() {
        return lastPoint;
    }

    useEffect(() => {
        console.log('last point change')
    }, [lastPoint])

    useEffect(() => {
        if (isCalledRef.current) return;
        isCalledRef.current = true;

        getData();
        initializeDatabase();
        initializeLocationHandler();

        BackgroundGeolocation.removeAllListeners();

        BackgroundGeolocation.on('location', function(location) {
            BackgroundGeolocation.startTask((taskKey) => {
                console.log(location);
                handleLocationUpdate(location, setLastPoint, setCurrentDrive).then(() => {
                    BackgroundGeolocation.endTask(taskKey);
                });
            })
        });

        BackgroundGeolocation.headlessTask(function(event) {
            if (event.name === 'location' ||
              event.name === 'stationary') {
                console.log(event.params);
            }
        
            return 'Processing event: ' + event.name;
        });

        BackgroundGeolocation.on('error', function(error) {
            console.log('[ERROR] BackgroundGeolocation error:', error);
        });

        BackgroundGeolocation.on('start', function() {
            console.log('[INFO] BackgroundGeolocation service has been started');
        });

        BackgroundGeolocation.on('stop', function() {
            console.log('[INFO] BackgroundGeolocation service has been stopped');
        });

        BackgroundGeolocation.on('authorization', function(status) {
            console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
            if (status !== BackgroundGeolocation.AUTHORIZED) {
              // we need to set delay or otherwise alert may not be shown
              setTimeout(function() {
                const showSettings = confirm('App requires location tracking permission. Would you like to open app settings?');
                if (showSettings) {
                  return BackgroundGeolocation.showAppSettings();
                }
                return;
              }, 1000);
            }
        });
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
