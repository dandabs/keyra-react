import React from 'react';
import { useState } from 'react';
import { IonPage, IonContent, IonSegment, IonSegmentButton, IonLabel, IonImg } from '@ionic/react';
import Signin from './Signin';
import Register from './Register';
import './Auth.css';

const Auth: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'signin' | 'register'>('signin');

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="content">

          <div className="hero">
            <div className="text">
              <h1>Ready to go?</h1>
            </div>
            <IonImg className="image"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/G01.21.svg/800px-G01.21.svg.png"
            />
          </div>

        <IonSegment value={selectedTab} onIonChange={(e) => setSelectedTab(e.detail.value as 'signin' | 'register')}>
          <IonSegmentButton value="signin">
            <IonLabel>Sign In</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="register">
            <IonLabel>Register</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        {selectedTab === 'signin' ? <Signin /> : <Register />}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Auth;