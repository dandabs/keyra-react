import React from 'react';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import './App.css';

import Welcome from './pages/Welcome';
import AuthGuard from './guards/AuthGuard';
import TabsLayout from './pages/Tabs/Tabs';
import AutoLoginGuard from './guards/AutoLoginGuard';
import Auth from './pages/Auth/Auth';
import SetUsername from './pages/Auth/SetUsername';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
        <IonRouterOutlet>
          <AuthGuard path="/tabs" component={TabsLayout} />
          <AutoLoginGuard exact path="/auth" component={Auth} />
          <AuthGuard exact path="/set-username" component={SetUsername} />
          <AutoLoginGuard exact path="/" component={Welcome} />
        </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;