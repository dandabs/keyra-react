import React, { useEffect, useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory, useParams } from 'react-router';
import { apiAxiosClient } from '../../axios';
import { MapContainer, TileLayer, Polyline } from "react-leaflet";

const DriveView: React.FC = () => {
    const history = useHistory();
    const { driveId } = useParams() as { driveId: string };
    const [drive, setDrive] = useState<any>();

    async function getData() {
        const response = await apiAxiosClient.get(`/drives/${driveId}`);
        setDrive(response.data);
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <IonPage>
        <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
            <IonBackButton>Back</IonBackButton>
            </IonButtons>
            <IonTitle>Drive</IonTitle>
        </IonToolbar>
        </IonHeader>
        <IonContent>

            <div style={{ width: '100vw', height: '100vh', display: 'flex', flex: 1, flexGrow: 1 }}>
                <MapContainer style={{ flexGrow: 1 }}>
                    <TileLayer
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </MapContainer>
            </div>

            <IonModal
                isOpen={true}
                initialBreakpoint={0.5}
                breakpoints={[0.25, 0.5, 0.75]}
                backdropDismiss={false}
                backdropBreakpoint={0.5}>

            </IonModal>
        </IonContent>
        </IonPage>
    );
};

export default DriveView;
