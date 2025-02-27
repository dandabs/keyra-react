import React, { useEffect, useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router';
import userPool, { getUserDetails } from '../../../cognitoConfig';

const ProfileEdit: React.FC = () => {
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [location, setLocation] = useState('');
  const [locationError, setLocationError] = useState('');


  useEffect(() => {
    async function getData() {
      const attr = await getUserDetails();
      setUsername(attr.preferred_username || '');
      setName(attr.name || '');
      setLocation(attr.address || '');
    }
    getData();
  }, []);

  const saveProfile = async () => {
    if (username.trim() === '') {
      setUsernameError('Username cannot be empty.');
      return;
    }
    if (name.trim() === '') {
      setNameError('Name cannot be empty.');
      return;
    }

    try {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) throw Error();

      cognitoUser.getSession((err: Error) => {
        if (err) {
            setUsernameError('Failed to get session: ' + err);
        } else {
            cognitoUser.updateAttributes([
                { Name: 'preferred_username', Value: username },
                { Name: 'name', Value: name },
                { Name: 'address', Value: location },
              ], (err) => {
                if (err) {
                  setUsernameError(err.message);
                } else {
                  setUsernameError('')
                  return history.goBack();
                }
              });
        }
      });
      
    } catch (err) {
      setUsernameError('An error occurred: ' + err);
    }
  }

  return (
    <IonPage>
      <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton>Back</IonBackButton>
        </IonButtons>
        <IonTitle>Edit Profile</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={saveProfile}>Save</IonButton>
        </IonButtons>
      </IonToolbar>
      </IonHeader>
      <IonContent>

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
        </div>

      </IonContent>
    </IonPage>
  );
};

export default ProfileEdit;
