import React, { useEffect } from 'react';
import { IonActionSheet, IonAlert, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonNavLink, IonPage, IonSkeletonText, IonText, IonTitle, IonToolbar, useIonLoading, useIonViewWillEnter } from '@ionic/react';
import './Dashboard.css';
import { useDrive } from '../../contexts/DriveContext';
import { endDrive, getCurrentDrive, MINIMUM_DRIVE_PAUSE_SPEED, syncDrivesToServer } from '../../driveHandler';

import { Http } from '@capacitor-community/http';

import { PluginListenerHandle } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { formatCurrency, msToKmh, msToKmhLabel, msToM, msToMph, msToMphLabel, msToTimeLabel, mToKmLabel, mToMi, mToMiLabel, getDistance } from '../../utils';
import { apiAxiosClient, genericAxiosClient } from '../../axios';
import { Preferences } from '@capacitor/preferences';
import currencies from '../../currencies';
import { Link } from 'react-router-dom';
import { useFuel } from '../../contexts/FuelContext';
import { useProfile } from '../../contexts/ProfileContext';

let accelHandler: PluginListenerHandle;

const Tab1: React.FC = () => {
  const { currentDrive, lastPoint } = useDrive()!;

  const [drive, setDrive] = React.useState<any>(null);

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const [present, dismiss] = useIonLoading();

  const { numberSystem, setNumberSystem, yearStats, cars, refreshCars, attributes } = useProfile()!;
  
  const [defaultCar, setDefaultCar] = React.useState<any>(null);

  const changeDefaultCarAlertRef = React.useRef<HTMLIonAlertElement>(null);
  const changeEfficiencyAlertRef = React.useRef<HTMLIonAlertElement>(null);
  
  const { setFuelPrice, fuelPrice, setFuelCurrency, fuelCurrency, setFuelSyncStationId, fuelSyncStation } = useFuel()!;

  const manualFuelAlertRef = React.useRef<HTMLIonAlertElement>(null);
  const automaticFuelAlertRef = React.useRef<HTMLIonAlertElement>(null);

  const [fuelStations, setFuelStations] = React.useState<any[]>([]);

  console.log(lastPoint);

  async function getData() {
    const current = await getCurrentDrive()
    if (!currentDrive) setDrive(current);
    setDefaultCar((await Preferences.get({ key: 'defaultCar' })).value);

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
            <IonTitle size="large">Hey {attributes?.name}</IonTitle>
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
                  {
                    yearStats ?
                    <span>{numberSystem === 'metric' ? mToKmLabel(yearStats?.totalDistance) : mToMiLabel(yearStats?.totalDistance) }</span>
                    :
                    <IonSkeletonText animated style={{ width: '5rem' }} />
                  }
                </div>

                <div className="urban-sign-card--place">
                  <span>Time</span>
                  {
                    yearStats ?
                    <span>{msToTimeLabel(yearStats?.totalDuration)}</span>
                    :
                    <IonSkeletonText animated style={{ width: '5rem' }} />
                  }
                </div>

                <div className="urban-sign-card--place">
                  <span>Cost</span>
                  {
                    yearStats ?
                    <span>{formatCurrency(yearStats?.totalCost, fuelCurrency)}</span>
                    :
                    <IonSkeletonText animated style={{ width: '5rem' }} />
                  }
                </div>

                <div className="urban-sign-card--place">
                  <span>Speed (Ø)</span>
                  {
                    yearStats ?
                    <span>{numberSystem === 'metric' ? msToKmhLabel(yearStats?.averageSpeed) : msToMphLabel(yearStats?.averageSpeed)}</span>
                    :
                    <IonSkeletonText animated style={{ width: '5rem' }} />
                  }
                </div>

                <div className="urban-sign-card--place">
                  <span>Speed (&#8811;)</span>
                  {
                    yearStats ?
                    <span>{numberSystem === 'metric' ? msToKmhLabel(yearStats?.topSpeed) : msToMphLabel(yearStats?.topSpeed)}</span>
                    :
                    <IonSkeletonText animated style={{ width: '5rem' }} />
                  }
                </div>

              </div>
            </div>
          </IonCard>

          {
            defaultCar && cars &&
            <>
              <h2>Drive preferences</h2>

              <IonCard className="rural-sign-card" button id='open-car-actions' style={{ marginBottom: '0', marginTop: '5px' }}>
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

              <IonCard className="fuel-card" button id='open-fuel-actions' style={{ marginBottom: '0', marginTop: '10px' }}>
                <div className="rural-sign-card--container-x">
                <span style={{ flexGrow: 1, paddingLeft: '5px' }}>Fuel</span>
                <span style={{ paddingRight: '5px' }}>{currencies.find(c=>c.code==fuelCurrency)?.format.replace('%','')}</span>
                  <div className="fuel-card--price" style={{ marginRight: '10px' }}>{fuelPrice.toFixed(currencies.find(c=>c.code==fuelCurrency)?.decimals || 0)}</div>
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
              refreshCars();
          }}
        ></IonAlert>

          <IonActionSheet
            trigger="open-fuel-actions"
            header="Set new fuel price"
            buttons={[
              {
                text: 'Set manually',
                data: {
                  action: 'manual',
                },
              },
              {
                text: 'Link to fuel station',
                data: {
                  action: 'automatic',
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
              if (event.detail.data?.action === 'manual') manualFuelAlertRef.current?.present();
              if (event.detail.data?.action === 'automatic') automaticFuelAlertRef.current?.present();
            }}
          ></IonActionSheet>

        <IonAlert
          ref={manualFuelAlertRef}
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
              await Preferences.remove({ key: 'fuelSyncStation' });
          }}
        ></IonAlert>

        <IonAlert
          onIonAlertWillPresent={async () => {
            if (fuelCurrency == 'ISK') {
              const fuelQuery = await genericAxiosClient.get('https://raw.githubusercontent.com/gasvaktin/gasvaktin/refs/heads/master/vaktin/gas.json');
              const stations = fuelQuery.data.stations;
              const sArr: any[] = [];
              for (const i in stations) {
                const station = stations[i];
                
                if (station.bensin95) {
                  sArr.push({
                    type: 'radio',
                    label: `${station.name} ${station.company} (Bensín)`,
                    value: `gasvatkin-${station.key}-bensin95`,
                    price: station.bensin95,
                  });
                }

                if (station.diesel) {
                  sArr.push({
                    type: 'radio',
                    label: `${station.name} ${station.company} (Dísel)`,
                    value: `gasvatkin-${station.key}-diesel`,
                    price: station.diesel,
                  });
                }

              }
              setFuelStations(sArr.sort((a, b) => a.label.localeCompare(b.label)));
            }
            if (fuelCurrency == 'GBP') {

                const { data: applegreenData } = await Http.request({ method: 'GET', url: 'https://applegreenstores.com/fuel-prices/data.json' });
                const { data: asconaData } = await Http.request({ method: 'GET', url: 'https://fuelprices.asconagroup.co.uk/newfuel.json' });
                const { data: asdaData } = await Http.request({ method: 'GET', url: 'https://storelocator.asda.com/fuel_prices_data.json' });
                const { data: bpData } = await Http.request({ method: 'GET', url: 'https://www.bp.com/en_gb/united-kingdom/home/fuelprices/fuel_prices_data.json' });
                const { data: essoData } = await Http.request({ method: 'GET', url: 'https://fuelprices.esso.co.uk/latestdata.json' });
                const { data: jetData } = await Http.request({ method: 'GET', url: 'https://jetlocal.co.uk/fuel_prices_data.json' });
                const { data: karanData } = await Http.request({ method: 'GET', url: 'https://api2.krlmedia.com/integration/live_price/krl' });
                const { data: morrisonsData } = await Http.request({ method: 'GET', url: 'https://www.morrisons.com/fuel-prices/fuel.json' });
                const { data: motoData } = await Http.request({ method: 'GET', url: 'https://moto-way.com/fuel-price/fuel_prices.json' });
                const { data: motorFuelData } = await Http.request({ method: 'GET', url: 'https://fuel.motorfuelgroup.com/fuel_prices_data.json' });
                const { data: rontecData } = await Http.request({ method: 'GET', url: 'https://www.rontec-servicestations.co.uk/fuel-prices/data/fuel_prices_data.json' });
                const { data: sainsburysData } = await Http.request({ method: 'GET', url: 'https://api.sainsburys.co.uk/v1/exports/latest/fuel_prices_data.json' });
                const { data: shellData } = await Http.request({ method: 'GET', url: 'https://www.shell.co.uk/fuel-prices-data.html' });
                const { data: sgnData } = await Http.request({ method: 'GET', url: 'https://www.sgnretail.uk/files/data/SGN_daily_fuel_prices.json' });
                const { data: tescoData } = await Http.request({ method: 'GET', url: 'https://www.tesco.com/fuel_prices/fuel_prices_data.json' });

                const stations = [
                ...(applegreenData.stations || []).map((s: any) => { return { ...s, source: 'applegreen' } }),
                ...(asconaData.stations || []).map((s: any) => { return { ...s, source: 'ascona' } }),
                ...(asdaData.stations || []).map((s: any) => { return { ...s, source: 'asda' } }),
                ...(bpData.stations || []).map((s: any) => { return { ...s, source: 'bp' } }),
                ...(essoData.stations || []).map((s: any) => { return { ...s, source: 'esso' } }),
                ...(jetData.stations || []).map((s: any) => { return { ...s, source: 'jet' } }),
                ...(karanData.stations || []).map((s: any) => { return { ...s, source: 'karan' } }),
                ...(morrisonsData.stations || []).map((s: any) => { return { ...s, source: 'morrisons' } }),
                ...(motoData.stations || []).map((s: any) => { return { ...s, source: 'moto' } }),
                ...(motorFuelData.stations || []).map((s: any) => { return { ...s, source: 'motorfuel' } }),
                ...(rontecData.stations || []).map((s: any) => { return { ...s, source: 'rontec' } }),
                ...(sainsburysData.stations || []).map((s: any) => { return { ...s, source: 'sainsburys' } }),
                ...(shellData.stations || []).map((s: any) => { return { ...s, source: 'shell' } }),
                ...(sgnData.stations || []).map((s: any) => { return { ...s, source: 'sgn' } }),
                ...(tescoData.stations || []).map((s: any) => { return { ...s, source: 'tesco' } }),
                ];

                console.log(stations);

              const sArr: any[] = [];
              for (const i in stations) {
                const station = stations[i];
                
                  if (station.prices.E10) {
                    sArr.push({
                      type: 'radio',
                      label: `${station.brand} ${station.address} (Unleaded E10)`,
                      value: `${station.source}-${station.site_id}-prices.E10`,
                      latitude: station.location.latitude,
                      longitude: station.location.longitude,
                      price: Math.round(station.prices.E10) / 100,
                    });
                  }

                  if (station.prices.E5) {
                    sArr.push({
                      type: 'radio',
                      label: `${station.brand} ${station.address} (Unleaded E5)`,
                      value: `${station.source}-${station.site_id}-prices.E5`,
                      latitude: station.location.latitude,
                      longitude: station.location.longitude,
                      price: Math.round(station.prices.E5) / 100,
                    });
                  }

                  if (station.prices.B7) {
                    sArr.push({
                      type: 'radio',
                      label: `${station.brand} ${station.address} (Diesel)`,
                      value: `${station.source}-${station.site_id}-prices.B7`,
                      latitude: station.location.latitude,
                      longitude: station.location.longitude,
                      price: Math.round(station.prices.B7) / 100,
                    });
                  }

              }

              const sorted = sArr.sort((a, b) => {
                if (lastPoint) 
                return getDistance(lastPoint.latitude, lastPoint.longitude, a.latitude, a.longitude) - getDistance(lastPoint.latitude, lastPoint.longitude, b.latitude, b.longitude);
                //return getDistance(54.890989, -6.132461, a.latitude, a.longitude) - getDistance(54.890989, -6.132461, b.latitude, b.longitude);

                return a.label.localeCompare(b.label);
              });
              setFuelStations(sorted);
              console.log(sorted);
            }
          }}
          ref={automaticFuelAlertRef}
          header={`Select a ${fuelCurrency} fuel station to link to`}
          buttons={['OK']}
          inputs={fuelStations}
          onDidDismiss={(event) => {
              console.log(event.detail);
              if (!event.detail.data) return;
              if (!event.detail.data.values) return;
              setFuelSyncStationId(event.detail.data.values);
              setFuelPrice(fuelStations.find(s => s.value == event.detail.data.values)?.price)
          }}
        ></IonAlert>

            </>
          }

          {
            !defaultCar &&
            <>
            <IonText color="medium">
            <p>Looking to record your drives? You&#39;ll need to create a car on the <Link to="/tabs/profile">Profile page</Link>.</p>
            </IonText>
            </>
          }

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
