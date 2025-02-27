import React, { RefObject, useEffect, useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonContent, IonFooter, IonHeader, IonInput, IonItem, IonList, IonModal, IonPage, IonTitle, IonToolbar, useIonLoading, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { useHistory, useParams } from 'react-router';
import { apiAxiosClient } from '../../axios';
import { MapContainer, TileLayer, Polyline, MapContainerProps, useMap, Marker, Popup } from "react-leaflet";
import { LatLngExpression, Map } from 'leaflet';
import L from "leaflet";
import { Preferences } from '@capacitor/preferences';
import { formatCurrency, msToKmh, msToKmhLabel, msToMph, msToMphLabel, mToKm, mToMi } from '../../utils';

const About: React.FC = () => {

    return (
        <IonPage>
        <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
            <IonBackButton>Back</IonBackButton>
            </IonButtons>
            <IonTitle>About Keyra</IonTitle>
        </IonToolbar>
        </IonHeader>

        <IonContent>

            <div className="content-top">
                <p>Developed with love in<br/>Belfast, Northern Ireland<br/>and Akureyri, Iceland.</p>

                <p>Copyright 2025 &copy; All Rights Reserved to Daniel Adams (kt. 050705-3660).</p>

                <p>Thanks to the following sources who provide the data which Keyra uses to function:</p>

                <IonList>
                    <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="https://nhsbtdbe.blob.core.windows.net/umbraco-assets-corp/23973/dvla_3298_sml_aw.png" style={{ width: '25vw' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '1rem', textAlign: 'center', width: '100%'}}>
                            <p><strong>DVLA</strong></p>
                            <p>UK vehicle registration data</p>
                        </div>
                    </IonItem>
                    <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR_Mg72NtXjpRtUDOL1zeCDhzEiTh2Pn8lVg&s" style={{ width: '25vw' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '1rem', textAlign: 'center', width: '100%'}}>
                            <p><strong>Samgöngustofa</strong></p>
                            <p>Iceland vehicle registration data</p>
                        </div>
                    </IonItem>
                    <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="https://images.ctfassets.net/8k0h54kbe6bj/5tiEHnRdArpbfzvzeRqEp3/cdd5da36675d8cfc5c2bbf67c3a03b29/islandis.png" style={{ width: '25vw' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '1rem', textAlign: 'center', width: '100%'}}>
                            <p><strong>Digital Iceland</strong></p>
                            <p>Iceland vehicle registration API</p>
                        </div>
                    </IonItem>
                    <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="https://camo.githubusercontent.com/1b9e427339c09cff0259be1cc67a35d3cdf2af8235683128d97534321c9b0989/68747470733a2f2f67617376616b74696e2e69732f696d616765732f67617376616b74696e2e706e67" style={{ width: '25vw' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '1rem', textAlign: 'center', width: '100%'}}>
                            <p><strong>Gasvatkin</strong></p>
                            <p>Iceland fuel prices</p>
                        </div>
                    </IonItem>
                    <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Openstreetmap_logo.svg/1200px-Openstreetmap_logo.svg.png" style={{ width: '25vw' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '1rem', textAlign: 'center', width: '100%'}}>
                            <p><strong>OpenStreetMap</strong></p>
                            <p>Interactive maps and speed limits</p>
                        </div>
                    </IonItem>
                    <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Mapbox_logo_2019.svg/640px-Mapbox_logo_2019.svg.png" style={{ width: '25vw' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '1rem', textAlign: 'center', width: '100%'}}>
                            <p><strong>Mapbox</strong></p>
                            <p>Directions and road snapping</p>
                        </div>
                    </IonItem>
                </IonList>
            </div>

        </IonContent>
        </IonPage>
    );
};

export default About;
