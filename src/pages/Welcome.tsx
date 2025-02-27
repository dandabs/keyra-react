import React from 'react';
import { IonPage, IonContent, IonButton, IonImg } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Welcome.css';

const Welcome: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent className="ion-padding" forceOverscroll={false} fullscreen>
        <div className="content">

        <IonImg
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/F21.11.svg/1280px-F21.11.svg.png"
            className="hero"
        />
        
        <div className="center">
            <h1>Welcome to Keyra</h1>
            <p>Track your drives, total your miles, and see how much each trip costs – then share your journeys with friends!</p>
        </div>

        <IonButton className="button-full" onClick={() => history.push('/auth')}>
          Get started
        </IonButton>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Welcome;
