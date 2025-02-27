import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, RefresherEventDetail } from '@ionic/react';
import './Trips.css';
import { apiAxiosClient } from '../../axios';
import { carSharp, locationSharp, trashBin } from 'ionicons/icons';
import { msToM, msToTimeLabel, mToKmLabel, mToMi, mToMiLabel } from '../../utils';
import { Preferences } from '@capacitor/preferences';
import { useHistory } from 'react-router';

const Trips: React.FC = () => {
  const [drives, setDrives] = useState([]);
  const [numberSystem, setNumberSystem] = useState('metric');
  const history = useHistory();

  async function getData(event?: CustomEvent<RefresherEventDetail>) {
    const driveRes = await apiAxiosClient.get('/drives');
    setDrives(driveRes.data);
    setNumberSystem((await Preferences.get({ key: 'numberSystem' })).value || 'metric');
    if (event) event.detail.complete();
  }

  useEffect(() => { getData(); }, []);
  
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
          <IonList lines="none">
            {
              drives.sort((a: any, b: any) => b.startTime - a.startTime).map((drive: any) => (
                <IonItemSliding key={drive.PK}>
                  <IonItem lines="none" color="light" button onClick={() => { history.push(`/tabs/drive/${drive.PK}`) }}>
                    <div className="drive-inner-container">
                      <div className="locations-container">
                        <div className="location-icon-container">
                          <IonIcon aria-hidden="true" icon={locationSharp} slot="start"></IonIcon>
                          <IonLabel className="place">{drive.from}</IonLabel>
                          <IonLabel className="time">{
                          new Date(drive.startTime * 1000).toLocaleTimeString("en", {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: false,
                            second: undefined
                          })
                          }</IonLabel>
                        </div>
                        <div className="location-icon-container">
                          <IonIcon aria-hidden="true" icon={locationSharp} slot="start"></IonIcon>
                          <IonLabel className="place">{drive.to}</IonLabel>
                          <IonLabel className="time">{
                          new Date(drive.endTime * 1000).toLocaleTimeString("en", {
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
                        <IonLabel className="place">{msToTimeLabel(drive.duration)} - {numberSystem == 'metric' ? mToKmLabel(drive.distance) : mToMiLabel(drive.distance)}</IonLabel>
                      </div>
                    </div>
                  </IonItem>
                  <IonItemOptions slot="end">
                    <IonItemOption color="primary">
                      <IonIcon slot="icon-only" icon={carSharp}></IonIcon>
                    </IonItemOption>
                    <IonItemOption color="danger" expandable={true}>
                      <IonIcon slot="icon-only" icon={trashBin}></IonIcon>
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))
            }
          </IonList>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Trips;
