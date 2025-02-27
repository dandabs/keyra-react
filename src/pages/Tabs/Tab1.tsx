import React, { useEffect } from 'react';
import { IonActionSheet, IonAlert, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonLoading, useIonViewWillEnter } from '@ionic/react';
import './Dashboard.css';
import { useDrive } from '../../contexts/DriveContext';
import { getUserDetails } from '../../cognitoConfig';
import { endDrive, getCurrentDrive, MINIMUM_DRIVE_PAUSE_SPEED, syncDrivesToServer } from '../../driveHandler';

import { PluginListenerHandle } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { formatCurrency, msToKmh, msToKmhLabel, msToM, msToMph, msToMphLabel, msToTimeLabel, mToKmLabel, mToMi, mToMiLabel } from '../../utils';
import { apiAxiosClient } from '../../axios';
import { Preferences } from '@capacitor/preferences';

let accelHandler: PluginListenerHandle;

const Tab1: React.FC = () => {
  const { currentDrive, lastPoint } = useDrive()!;
  const [user, setUser] = React.useState<any>(null);
  const [drive, setDrive] = React.useState<any>(null);

  const [stats, setStats] = React.useState<any>(null);

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const [present, dismiss] = useIonLoading();

  const [numberSystem, setNumberSystem] = React.useState<string>('metric');

  const [cars, setCars] = React.useState<any[]>([]);
  const [defaultCar, setDefaultCar] = React.useState<any>(null);

  const changeDefaultCarAlertRef = React.useRef<HTMLIonAlertElement>(null);
  const changeEfficiencyAlertRef = React.useRef<HTMLIonAlertElement>(null);

  const [fuelPrice, setFuelPrice] = React.useState<number>(0);
  const [fuelCurrency, setFuelCurrency] = React.useState<string>('ISK');

  async function getData() {
    const current = await getCurrentDrive()
    if (!currentDrive) setDrive(current);
    if (!user) setUser(await getUserDetails());
    setCars((await apiAxiosClient.get('/car')).data);
    setDefaultCar((await Preferences.get({ key: 'defaultCar' })).value);

    setNumberSystem((await (await Preferences.get({ key: 'numberSystem' })).value) || 'metric');
    setFuelCurrency((await Preferences.get({ key: 'fuelCurrency' })).value || 'ISK');
    setFuelPrice(parseFloat((await Preferences.get({ key: 'fuelPrice' })).value || '0'));
    
    const statsResult = await apiAxiosClient.get(`/stats/year/${new Date().getFullYear()}`);
    setStats(statsResult.data);

    accelHandler = await Motion.addListener('accel', event => {
      console.log(event);
    });
  }

  useIonViewWillEnter(() => {
    getCurrentDrive().then(setDrive);
  });

  useEffect(() => {
    getData();
    syncDrivesToServer();
  }, []);

  useEffect(() =>{
    setDrive(currentDrive);
  }, [currentDrive]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Hey {user?.name}</IonTitle>
            <IonButtons collapse={true} slot="end" style={{ paddingRight: '10px' }}>
              <div>
                <div className="speed-sign">
                  <span>{
                    numberSystem == 'metric' ?
                    Math.round(msToKmh(lastPoint?.speed || currentDrive?.points[0].speed < 0 ? 0 : currentDrive?.points[0].speed || 0))
                    :
                    Math.round(msToMph(lastPoint?.speed || currentDrive?.points[0].speed < 0 ? 0 : currentDrive?.points[0].speed || 0))
                    }</span>
                </div>
              </div>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonAlert
          isOpen={isAlertOpen}
          header="Allow accelerometer access?"
          message="We need access to your phone's accelerometer in order to provide accurate speed readings for your drives."
          buttons={['Go']}
          onDidDismiss={async () => {
            await (DeviceMotionEvent as any).requestPermission();
            setIsAlertOpen(false);
          }}
          onClick={async () => {
            await (DeviceMotionEvent as any).requestPermission();
            setIsAlertOpen(false);
          }}
        ></IonAlert>

        <div className="content-top" style={{ gap: '0' }}>

          {drive &&
            <IonCard className="rural-sign-card" style={{ marginBottom: '0'}}>
              <IonCardHeader style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <IonCardTitle>{
                  drive.isPaused ?
                  `Drive is paused` :
                  `Driving for ${Math.round(mToMi(drive.distanceElapsed))}mi`
                  }</IonCardTitle>
                <div>
                  <div className="speed-sign">
                  <span>{
                    numberSystem == 'metric' ?
                    Math.round(msToKmh(lastPoint?.speed || currentDrive?.points[0].speed < 0 ? 0 : currentDrive?.points[0].speed || 0))
                    :
                    Math.round(msToMph(lastPoint?.speed || currentDrive?.points[0].speed < 0 ? 0 : currentDrive?.points[0].speed || 0))
                    }</span>
                  </div>
                </div>
              </IonCardHeader>

              <IonCardContent className="no-padding">
                {msToTimeLabel(drive.timeElapsed)} elapsed, at an average of { numberSystem === 'metric' ? msToKmhLabel(drive.averageSpeed) : msToKmhLabel(drive.averageSpeed) }
              </IonCardContent>

              <IonButton
                color="dark"
                fill="clear"
                disabled={lastPoint ? (lastPoint?.speed || drive.points[0].speed < 0 ? 0 : drive.points[0].speed || 0) > MINIMUM_DRIVE_PAUSE_SPEED : true}
                onClick={async () => {
                  present();
                  await endDrive(drive.id);
                  await syncDrivesToServer();
                  dismiss();
                }}
              >
                End drive
              </IonButton>
            </IonCard>
          }

          <IonCard className="urban-sign-card" style={{ marginBottom: '10px'}}>
            <div className="urban-sign-card--container">
              <div className="urban-sign-card--route">{new Date().getFullYear()}</div>
              <div className="urban-sign-card--places">

                <div className="urban-sign-card--place">
                  <span>Distance</span>
                  <span>{numberSystem === 'metric' ? mToKmLabel(stats?.totalDistance) : mToMiLabel(stats?.totalDistance) }</span>
                </div>

                <div className="urban-sign-card--place">
                  <span>Time</span>
                  <span>{msToTimeLabel(stats?.totalDuration)}</span>
                </div>

                <div className="urban-sign-card--place">
                  <span>Cost</span>
                  <span>{formatCurrency(stats?.totalCost || 0, fuelCurrency)}</span>
                </div>

                <div className="urban-sign-card--place">
                  <span>Speed (Ø)</span>
                  <span>{numberSystem === 'metric' ? msToKmhLabel(stats?.averageSpeed) : msToMphLabel(stats?.averageSpeed)}</span>
                </div>

                <div className="urban-sign-card--place">
                  <span>Speed (&#8811;)</span>
                  <span>{numberSystem === 'metric' ? msToKmhLabel(stats?.topSpeed) : msToMphLabel(stats?.topSpeed)}</span>
                </div>

              </div>
            </div>
          </IonCard>

          <h2>Default car</h2>

          <IonCard className="rural-sign-card" button id='open-car-actions' style={{ marginBottom: '0', marginTop: '10px' }}>
            <div className="rural-sign-card--container-x">
              <div className="rural-sign-card--route">{
                numberSystem === 'metric' ?
                Math.round(282.48 / cars.find((car => car.PK == defaultCar))?.efficiencyMpg)
                :
                Math.round(cars.find((car => car.PK == defaultCar))?.efficiencyMpg)
                }</div>
              <span style={{ flexGrow: 1, paddingLeft: '10px', paddingRight: '10px' }}>{cars.find((car => car.PK == defaultCar))?.name}</span>
              <span>&rsaquo;</span>
            </div>
          </IonCard>

          <IonCard className="fuel-card" button id='open-fuel'>
            <div className="rural-sign-card--container-x">
            <span style={{ flexGrow: 1, paddingLeft: '5px' }}>Fuel ({fuelCurrency})</span>
              <div className="fuel-card--price" style={{ marginRight: '10px' }}>{fuelPrice}</div>
              <span>&rsaquo;</span>
            </div>
          </IonCard>
      
          <IonActionSheet
            trigger="open-car-actions"
            header="Default car"
            buttons={[
              {
                text: 'Change',
                data: {
                  action: 'change',
                },
              },
              {
                text: 'Update fuel economy',
                data: {
                  action: 'mileage',
                },
              },
              {
                text: 'Cancel',
                role: 'cancel',
                data: {
                  action: 'cancel',
                },
              },
            ]}
            onDidDismiss={(event) => {
              console.log(event);
              if (event.detail.data?.action === 'change') changeDefaultCarAlertRef.current?.present();
              if (event.detail.data?.action === 'mileage') changeEfficiencyAlertRef.current?.present();
            }}
          ></IonActionSheet>

        <IonAlert
          ref={changeDefaultCarAlertRef}
          header="Select the new default car"
          buttons={['OK']}
          inputs={cars.map(car => ({
            type: 'radio',
            label: car.name,
            value: car.PK,
          }))}
          onDidDismiss={(event) => {
              console.log(event.detail);
              if (!event.detail.data) return;
              if (!event.detail.data.values) return;
              Preferences.set({ key: 'defaultCar', value: event.detail.data.values });
              setDefaultCar(event.detail.data.values);
          }}
        ></IonAlert>

        <IonAlert
          ref={changeEfficiencyAlertRef}
          header="Type the new fuel efficiency reading"
          buttons={['OK']}
          inputs={[
            {
              type: 'number',
              placeholder: numberSystem === 'metric' ? 'L/100km' : 'mpg',
              min: 1,
              max: 100,
            },
          ]}
          onDidDismiss={async (event) => {
              if (!event.detail.data) return;
              if (!event.detail.data.values) return;
              await apiAxiosClient.put(`/car/${defaultCar}`, {
                ...cars.find(car => car.PK == defaultCar),
                efficiencyMpg: (numberSystem == 'metric' ? 282.48 / parseInt(event.detail.data.values[0]) : parseInt(event.detail.data.values[0])) || cars.find(car => car.PK == defaultCar).efficiencyMpg,
              });
              setCars((await apiAxiosClient.get('/car')).data);
          }}
        ></IonAlert>

        <IonAlert
          trigger="open-fuel"
          header={"Type the new fuel price, per litre, in " + fuelCurrency}
          buttons={['OK']}
          inputs={[
            {
              type: 'number',
              placeholder: fuelCurrency,
              min: 1,
              max: 1000,
            },
          ]}
          onDidDismiss={async (event) => {
              if (!event.detail.data) return;
              if (!event.detail.data.values) return;

              if (isNaN(parseFloat(event.detail.data.values[0]))) return;

              setFuelPrice(parseFloat(event.detail.data.values[0]));
              
              await Preferences.set({ key: 'fuelPrice', value: event.detail.data.values[0] });
          }}
        ></IonAlert>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
