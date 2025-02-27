import React, { useRef, useState } from 'react';
import './ProfileContainer.css';
import { IonButton, IonImg, IonItem, IonSkeletonText, IonLabel, IonList, IonListHeader, IonNote, IonText, IonButtons, useIonViewWillEnter, IonModal, IonRefresher, IonRefresherContent, RefresherEventDetail, IonInput, IonSelect, IonSelectOption } from '@ionic/react';
import userPool from '../cognitoConfig';
import { useHistory } from 'react-router';
import CreateCarModalContainer from './CreateCarModalContainer';
import { apiAxiosClient } from '../axios';
import currencies from '../currencies';
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useFuel } from '../contexts/FuelContext';
import { useProfile } from '../contexts/ProfileContext';

const ProfileContainer: React.FC = () => {
    const { cars, attributes, updateAttributes } = useProfile()!;

    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friends, setFriends] = React.useState([]);

    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
  
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
  
    const [location, setLocation] = useState('');
    const [locationError, setLocationError] = useState('');

    const [imageData, setImageData] = useState<string | null>(null);

    const { numberSystem, setNumberSystem } = useProfile()!;

    const { fuelCurrency, setFuelCurrency } = useFuel()!;

    const history = useHistory();
    const modal = useRef<HTMLIonModalElement>(null);
    const profileModal = useRef<HTMLIonModalElement>(null);
    const preferencesModal = useRef<HTMLIonModalElement>(null);

    async function doFetch(event?: CustomEvent<RefresherEventDetail>) {
      setFriendsLoading(true);
      await Promise.all([
        apiAxiosClient.get('/friend').then((res) => { setFriends(res.data); setFriendsLoading(false); })
      ])

      if (event) event.detail.complete();
  }

    React.useEffect(() => {
        doFetch();
    }, []);

    React.useEffect(() => {
      setUsername(attributes?.preferred_username);
      setName(attributes?.name);
      setLocation(attributes?.address);
    }, [attributes])

    async function saveProfile() {
      if (username.trim() === '') {
        setUsernameError('Username cannot be empty.');
        return;
      }
      if (name.trim() === '') {
        setNameError('Name cannot be empty.');
        return;
      }
  
      try {
        await updateAttributes([
          { Name: 'preferred_username', Value: username },
          { Name: 'name', Value: name },
          { Name: 'address', Value: location },
        ]);
      } catch (err) {
        setUsernameError('An error occurred: ' + err);
      }
    }

    const selectImage = async (source: CameraSource) => {
      try {
        const photo = await Camera.getPhoto({
          quality: 50,
          allowEditing: true,
          resultType: CameraResultType.Base64,
          source,
        });
  
        if (photo.base64String) {
          const base64Image = `data:image/jpeg;base64,${photo.base64String}`;
          setImageData(base64Image);
          await uploadImage(photo.base64String);
        }
      } catch (error) {
        console.error("Error selecting image:", error);
      }
    };
  
    const uploadImage = async (base64String: string) => {
      try {
        const response = await apiAxiosClient.post(`/profile/picture`, {
          photo: base64String,
        });
  
        console.log("Upload Success:", response.data.url);

        try {
          await updateAttributes([ { Name: 'picture', Value: response.data.url } ])
        } catch (err) {
          console.log('An error occurred saving the photo: ' + err);
        }

      } catch (error) {
        console.error("Upload Error:", error);
      }
    };
    
  return (
    <div className="profile-container">
      <IonRefresher slot="fixed" onIonRefresh={doFetch}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>
      <div className="profile-header">
        <IonButton onClick={() => selectImage(CameraSource.Prompt)} fill="clear">
        <IonImg
        src={attributes?.picture ? attributes.picture + `?random=${Math.random()}` : "https://gravatar.com/avatar/default?f=y&d=mp"}
        className="avatar"
        ></IonImg>
        </IonButton>
        <div className="sign-outline">
            <div className="sign-route">
                <span>{ !friendsLoading ? friends.length : <IonSkeletonText animated={true} style={{ width: '10px' }}></IonSkeletonText> }</span>
            </div>
            <span>{ attributes ? attributes.preferred_username : <IonSkeletonText animated={true} style={{ width: '80px' }}></IonSkeletonText> }</span>
        </div>
        <span className="sub-text">{ attributes ? attributes.address : <IonSkeletonText animated={true} style={{ width: '80px' }}></IonSkeletonText> }</span>
      </div>
     
    <IonList className="list">
      <IonListHeader className="header">
        <IonLabel className="text-start2">Your cars</IonLabel>
        <IonButton id="create-car">Create</IonButton>
      </IonListHeader>
      {
        !cars && (
          <IonItem>
            <IonLabel>
              <div><IonSkeletonText animated={true} style={{ width: '120px' }}></IonSkeletonText></div>
              <div className="car-subtext"><IonSkeletonText animated={true} style={{ width: '160px' }}></IonSkeletonText></div>
              </IonLabel>
            <IonNote slot="end"><IonSkeletonText animated={true} style={{ width: '40px' }}></IonSkeletonText></IonNote>
          </IonItem>
        )
      }
      {
        cars && cars.map((car: any) => (
          <IonItem key={car.PK} button onClick={() => { history.push(`/tabs/profile/cars/${car.PK}`) }}>
            <IonLabel>
              <div>{car.name}</div>
              <div className="car-subtext">{car.year} {car.model}</div>
              </IonLabel>
            <IonNote slot="end">{numberSystem == 'metric' ? `${Math.round(282.48 / parseInt(car.efficiencyMpg))}L/100km` : `${Math.round(car.efficiencyMpg)}mpg`}</IonNote>
          </IonItem>
        ))
      }
    </IonList>

    <IonList className="list">
        <IonListHeader>
        <IonLabel className="text-start2">Settings</IonLabel>
      </IonListHeader>
      <IonItem button onClick={() => profileModal.current?.present()}>
        <IonLabel>Edit profile</IonLabel>
      </IonItem>
      <IonItem button onClick={() => preferencesModal.current?.present()}>
        <IonLabel>Edit preferences</IonLabel>
      </IonItem>
      <IonItem button onClick={() => history.push('/tabs/about')}>
        <IonLabel>About</IonLabel>
      </IonItem>
      <IonItem button onClick={() => { userPool.getCurrentUser()?.signOut(); history.push('/'); }}>
        <IonLabel color="danger">Sign out</IonLabel>
      </IonItem>
    </IonList>

    <IonModal ref={modal} trigger="create-car" initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.75]}>
      <CreateCarModalContainer />
    </IonModal>

    <IonModal ref={profileModal} trigger="edit-profile" initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.75]}>
      <div className="content-top">
        <IonList>
          <IonItem>
            <IonInput
              placeholder="grimur.freyr"
              type="text"
              onIonChange={(e) => setUsername(e.detail.value || '')}
              value={username}
              label="Username"
              errorText={usernameError}
              className={`${!usernameError && 'ion-valid'} ${usernameError && 'ion-invalid'} ${usernameError && 'ion-touched'}`}
            />
          </IonItem>
          <IonItem>
            <IonInput
              placeholder="Grímur"
              type="text"
              onIonChange={(e) => setName(e.detail.value || '')}
              value={name}
              label="Nickname"
              errorText={nameError}
              className={`${!nameError && 'ion-valid'} ${nameError && 'ion-invalid'} ${nameError && 'ion-touched'}`}
            />
          </IonItem>
          <IonItem>
            <IonInput
              placeholder="Akureyri, Iceland"
              type="text"
              onIonChange={(e) => setLocation(e.detail.value || '')}
              value={location}
              label="Location"
              errorText={locationError}
              className={`${!locationError && 'ion-valid'} ${locationError && 'ion-invalid'} ${locationError && 'ion-touched'}`}
            />
          </IonItem>
        </IonList>
        <IonButton onClick={saveProfile} expand="block">
            Save
        </IonButton>
      </div>
    </IonModal>

    <IonModal ref={preferencesModal} trigger="edit-preferences" initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.75]}>
      <div className="content-top">
        <IonList>
          <IonItem>
            <IonSelect label="Number system" placeholder="Select a system" value={numberSystem} onIonChange={(e) => setNumberSystem(e.detail.value)}>
              <IonSelectOption value="metric">Metric</IonSelectOption>
              <IonSelectOption value="imperial">Imperial</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonSelect label="Currency" placeholder="Select a currency" value={fuelCurrency} onIonChange={(e) => setFuelCurrency(e.detail.value)}>
              {
                currencies.map((currency) => (
                  <IonSelectOption value={currency.code} key={currency.code}>{currency.code}</IonSelectOption>
                ))
              }
            </IonSelect>
          </IonItem>
        </IonList>
      </div>
    </IonModal>

    </div>
  );
};

export default ProfileContainer;
