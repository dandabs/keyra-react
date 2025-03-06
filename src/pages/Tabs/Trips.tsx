import React, { useEffect, useState } from 'react';
import { IonAlert, IonContent, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonText, IonTitle, IonToolbar, RefresherEventDetail } from '@ionic/react';
import './Trips.css';
import { apiAxiosClient } from '../../axios';
import { carSharp, locationSharp, trashBin } from 'ionicons/icons';
import { distance, msToTimeLabel, mToKmLabel, mToMiLabel } from '../../utils';
import { useHistory } from 'react-router';
import { useProfile } from '../../contexts/ProfileContext';
import { DateTime } from 'luxon';

const Trips: React.FC = () => {
  const history = useHistory();

  const { numberSystem, setNumberSystem, cars, drives, refreshDrives } = useProfile()!;

  const [changeCarAlertId, setChangeCarAlertId] = useState<null | string>(null);

  async function getData(event?: CustomEvent<RefresherEventDetail>) {
    await refreshDrives();
    if (event) event.detail.complete();
  }
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Drives</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Drives</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonRefresher slot="fixed" onIonRefresh={getData}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <div className="content-top">
          {
            !drives || drives?.length === 0 && (
                <IonText color="medium"><p>You don&#39;t have any drives yet.</p></IonText>
            )
          }
          <IonList lines="none">
            {
              drives && drives.filter(drive => drive.STATUS == "ENRICHED").sort((a: any, b: any) => b.PK - a.PK).map((drive: any) => (
                <IonItemSliding key={drive.PK}>
                  <IonItem lines="none" color="light" button onClick={() => { history.push(`/tabs/drive/${drive.PK}`) }}>
                    <div className="drive-inner-container">
                      <div className="locations-container">
                        <div className="location-icon-container">
                          <IonIcon aria-hidden="true" icon={locationSharp} slot="start"></IonIcon>
                          <IonLabel className="place">{drive.FROM_NAME}</IonLabel>
                          <IonLabel className="time">{
                          new Date(DateTime.fromISO(drive.PK).toMillis()).toLocaleTimeString("en", {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: false,
                            second: undefined
                          })
                          }</IonLabel>
                        </div>
                        <div className="location-icon-container">
                          <IonIcon aria-hidden="true" icon={locationSharp} slot="start"></IonIcon>
                          <IonLabel className="place">{drive.TO_NAME}</IonLabel>
                          <IonLabel className="time">{
                          new Date(DateTime.fromISO(drive.END_TIME).toMillis()).toLocaleTimeString("en", {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: false,
                            second: undefined
                          })
                          }</IonLabel>
                        </div>
                      </div>
                      <div className="drive-details-container">
                        <IonLabel className="place">{ drive.carId }</IonLabel>
                        <IonLabel className="place">{msToTimeLabel(DateTime.fromISO(drive.END_TIME).diff(DateTime.fromISO(drive.PK)).toMillis())} - {numberSystem == 'metric' ? mToKmLabel(distance(drive.POINTS)) : mToMiLabel(distance(drive.POINTS))}</IonLabel>
                      </div>
                    </div>
                  </IonItem>
                  <IonItemOptions slot="end">
                    <IonItemOption color="primary" id='changeCarAlert' onClick={async () => {
                      setChangeCarAlertId(drive.PK);
                    }}>
                      <IonIcon slot="icon-only" icon={carSharp}></IonIcon>
                    </IonItemOption>
                    <IonItemOption color="danger" expandable={true} onClick={async () => {
                      await apiAxiosClient.delete(`/drives/${drive.PK}`);
                      getData();
                    }}>
                      <IonIcon slot="icon-only" icon={trashBin}></IonIcon>
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))
            }
          </IonList>
        </div>

        <IonAlert
          isOpen={!!changeCarAlertId}
          header={"Select the new car for this trip"}
          buttons={['OK']}
          inputs={cars ? cars.map((car: any) => ({
            type: 'radio',
            label: car.name,
            value: car.PK,
          })) : []}
          onDidDismiss={async (event) => {
              setChangeCarAlertId(null);
              console.log(event.detail);
              if (!event.detail.data) return;
              if (!event.detail.data.values) return;
              const drive: any = drives?.find((drive: any) => drive.PK === changeCarAlertId);
              if (!drive) return;

              await apiAxiosClient.put(`/drives/${drive.PK}`, {
                ...drive,
                carId: event.detail.data.values
              });

              getData();
                const itemSliding = document.querySelector(`ion-item-sliding[key="${drive.PK}"]`) as HTMLIonItemSlidingElement;
                if (itemSliding) {
                  itemSliding.close();
                }

                const list = document.querySelector('ion-list');
                if (list) {
                  list.closeSlidingItems();
                }
          }}
        ></IonAlert>

      </IonContent>
    </IonPage>
  );
};

export default Trips;
