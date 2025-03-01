import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonImg } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import userPool from '../../cognitoConfig';
import './Auth.css';
import { useProfile } from '../../contexts/ProfileContext';

const SetUsername: React.FC = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const { updateAttributes } = useProfile()!;

  const handleSubmit = async () => {
    if (username.trim() === '') {
      setError('Username cannot be empty.');
      return;
    }

    try {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) throw Error();

      await updateAttributes([
        { Name: 'preferred_username', Value: username },
      ]);
      setError('')
      return history.push('/tabs');
      
    } catch (err) {
      setError('An error occurred: ' + err);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div className="content">
        
        <div className="hero">
          <IonImg className="image"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Iceland_road_sign_D16.21.svg/1024px-Iceland_road_sign_D16.21.svg.png"
          />
          <div className="text-start">
            <h1>Set a username</h1>
            <p>{`Your username should be unique, and will be visible to all other app users.`}</p>
          </div>
        </div>

        <IonInput
            value={username}
            onIonChange={(e) => setUsername(e.detail.value || '')}
            clearInput
            placeholder="grimur.freyr"
            label="Username"
            errorText={error}
            className={`${!error && 'ion-valid'} ${!!error && 'ion-invalid'} ion-touched`}
          />
        <IonButton expand="full" onClick={handleSubmit}>
          Save
        </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};
export default SetUsername;
