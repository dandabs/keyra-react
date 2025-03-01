import { BackgroundGeolocationPlugin } from 'cordova-background-geolocation-plugin';

declare const BackgroundGeolocation: BackgroundGeolocationPlugin;

export const initializeLocationHandler = async () => {
    console.log(`Initialising location handler...`);

    await BackgroundGeolocation.configure({
        locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
        desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        activityType: 'AutomotiveNavigation',
        stationaryRadius: 10,
        distanceFilter: 3,
        notificationTitle: 'Keyra drive tracking',
        notificationText: 'enabled',
        interval: 500,
        stopOnTerminate: false,
        startForeground: true,
        debug: false,
        startOnBoot: true,
    });

    console.log(`Location handler initialised`);

    BackgroundGeolocation.checkStatus((status) => {
        console.log(`Location handler status: ${status.isRunning}`);
        console.log('Location authorization status: ' + status.authorization);
        if (!status.isRunning) {
            BackgroundGeolocation.start();
            console.log(`Location handler started`);
        }
    })
}
