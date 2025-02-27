import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { barChart, barChartSharp, carSharp, clipboard, clipboardSharp, homeSharp, person, triangle } from 'ionicons/icons';
import Tab1 from './Tab1';
import Profile from './Profile';
import ProfileEdit from './Profile/ProfileEdit';
import Car from './Profile/Cars/Car';
import Trips from './Trips';
import { DriveProvider } from '../../contexts/DriveContext';
import { initializeDatabase } from '../../databaseHandler';
import { initializeLocationHandler } from '../../locationHandler';
import DriveView from './Drive';
import About from './About';

const TabsLayout: React.FC = () => {
  return (
    <DriveProvider>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/tabs/tab1">
            <Tab1 />
          </Route>
          <Route exact path="/tabs/trips">
            <Trips />
          </Route>
          <Route exact path="/tabs/profile">
            <Profile />
          </Route>
          <Route exact path="/tabs">
            <Redirect to="/tabs/tab1" />
          </Route>

          <Route exact path="/tabs/profile/edit">
            <ProfileEdit />
          </Route>

          <Route path="/tabs/profile/cars/:registration">
            <Car />
          </Route>

          <Route path="/tabs/drive/:driveId">
            <DriveView />
          </Route>

          <Route path="/tabs/about">
            <About />
          </Route>

        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/tabs/tab1">
            <IonIcon aria-hidden="true" icon={barChart} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/tabs/trips">
            <IonIcon aria-hidden="true" icon={carSharp} />
            <IonLabel>Drives</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tabs/profile">
            <IonIcon aria-hidden="true" icon={person} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </DriveProvider>
  );
};

export default TabsLayout;
