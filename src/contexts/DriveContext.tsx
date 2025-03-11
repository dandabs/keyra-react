import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { initializeDatabase } from '../databaseHandler';
import { apiAxiosClient } from '../axios';
//import BackgroundGeolocation, { Location } from "@transistorsoft/capacitor-background-geolocation";
import { getToken } from '../cognitoConfig';

import * as TransistorsoftGeolocation from "@transistorsoft/capacitor-background-geolocation";

import { DateTime } from 'luxon';
import { v4 } from 'uuid';
import { Capacitor } from '@capacitor/core';

import { BackgroundGeolocationPlugin } from 'cordova-background-geolocation-plugin';
import { useProfile } from './ProfileContext';
import { IonButton, IonButtons, IonContent, IonHeader, IonImg, IonInput, IonItem, IonModal, IonToolbar } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
declare const BackgroundGeolocation: BackgroundGeolocationPlugin;

const DISTANCE_FILTER = 10;

interface DriveContextProps {
    currentDrive: any | null;
    lastPoint: any | null;
    getData: () => Promise<void>;
    setLastPoint: React.Dispatch<React.SetStateAction<any | null>>
}

const DriveContext = createContext<DriveContextProps | null>(null);

interface DriveProviderProps {
    children: ReactNode;
}

const DriveProvider = ({ children }: DriveProviderProps) => {
    const [currentDrive, setCurrentDrive] = useState<any | null>(null);
    const [lastPoint, setLastPoint] = useState<any | null>(null);

    const [isLocationPermissionModalOpen, setLocationPermissionModalOpen] = useState(false);

    const { cars } = useProfile()!;

    const isCalledRef = React.useRef(false);

    async function getData() {
        const drive = await apiAxiosClient.get('/current-drive');
        setCurrentDrive(drive.data.drive);
    }

    async function initializeLocation_ios() {
        TransistorsoftGeolocation.default.onLocation((location) => {
            setLastPoint(location);
            console.log(location);
        });

        TransistorsoftGeolocation.default.ready({
        desiredAccuracy: TransistorsoftGeolocation.default.DESIRED_ACCURACY_NAVIGATION,
        distanceFilter: DISTANCE_FILTER,
        stopTimeout: 5,
        debug: false,
        logLevel: TransistorsoftGeolocation.default.LOG_LEVEL_VERBOSE,
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

    async function initializeLocation_android() {
        BackgroundGeolocation.configure({
            locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
            desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
            stationaryRadius: 50,
            distanceFilter: DISTANCE_FILTER,
            notificationTitle: 'Drive tracking',
            notificationText: 'We are monitoring your drives, please keep the app running in the background to continue',
            debug: false,
            interval: 5000,
            fastestInterval: 5000,
            activitiesInterval: 10000,
            url: apiAxiosClient.defaults.baseURL + '/location',
            httpHeaders: {
              "Authorization": `Bearer ${await getToken()}`
            },
            postTemplate: {
                timestampMillis: '@time',
                coords: {
                    latitude: "@latitude",
                    longitude: "@longitude",
                    speed: "@speed",
                },
            }
        });

        BackgroundGeolocation.on('location', function(location) {
            setLastPoint({
                timestamp: DateTime.fromMillis(location.time).toISO() || '',
                age: 0,
                odometer: 0,
                is_moving: true,
                uuid: v4(),
                mock: location.isFromMockProvider,
                coords: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracy,
                    speed: location.speed
                },
                battery: {
                    is_charging: false,
                    level: 0
                },
                activity: {
                    type: 'unknown',
                    confidence: 0
                }
            });
        });

        BackgroundGeolocation.on('authorization', function(status) {
            console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
            if (status !== BackgroundGeolocation.AUTHORIZED) {
                setTimeout(function() {
                const showSettings = confirm('App requires location tracking permission. Would you like to open app settings?');
                if (showSettings) {
                    return BackgroundGeolocation.showAppSettings();
                }
                }, 1000);
            }
        });

        BackgroundGeolocation.start();
    }

    useEffect(() => {
        if (isCalledRef.current) return;
        isCalledRef.current = true;

        getData();
        initializeDatabase();
    }, []);

    async function initializeLocation() {
        console.log('Cars changed', cars);

        if (cars && cars.length > 0) {

        const locationPermissionRequested = await Preferences.get({ key: 'locationPermissionRequested' });
        console.log(locationPermissionRequested);
        if (!locationPermissionRequested.value || locationPermissionRequested.value == 'false') {
            setLocationPermissionModalOpen(true);
            return;
        }

        console.log('Location permission already asked for');

        
            console.log('Starting location services');
            if (Capacitor.getPlatform() === "ios") initializeLocation_ios();
            if (Capacitor.getPlatform() === "android") initializeLocation_android();
        } else {
            console.log('Not enough cars to start location services');
        }
    }

    useEffect(() => {
        initializeLocation();
    }, [cars]);

    return (
        <DriveContext.Provider value={{ currentDrive, lastPoint, getData, setLastPoint }}>
            { children }
            <IonModal isOpen={isLocationPermissionModalOpen}>
                <IonContent className="ion-padding" fullscreen>
                    <div className="content">
                    
                        <IonImg className="image" style={{ width: '40%' }}
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Iceland_road_sign_E02.11.svg/800px-Iceland_road_sign_E02.11.svg.png"
                        />

                        <div className="text-center">
                        <h1>Location usage</h1>
                        <p>Keyra collects location data to enable us to track your driving.</p>
                        <p>We record this data even when the app is closed or not in use, to ensure you do not use your phone while driving.</p>
                        </div>

                    <IonButton expand="full" onClick={async () => {
                        await Preferences.set({ key: 'locationPermissionRequested', value: 'true' });
                        try {
                            await initializeLocation();
                        } catch (e) {
                            console.error(e);
                        }
                        setLocationPermissionModalOpen(false);
                    }}>
                        Next
                    </IonButton>
                    </div>
                </IonContent>
            </IonModal>
        </DriveContext.Provider>
    )
}

const useDrive = () => {
    return useContext(DriveContext);
}

export { DriveProvider, useDrive };
