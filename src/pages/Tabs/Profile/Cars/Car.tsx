import React, { useEffect, useRef } from 'react';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory, useParams } from 'react-router';
import userPool from '../../../../cognitoConfig';
import { apiAxiosClient } from '../../../../axios';

const Car: React.FC = () => {
    const params = useParams() as any;
    const history = useHistory();

    const [car, setCar] = React.useState<any>(null);

    const [name, setName] = React.useState('');
    const [make, setMake] = React.useState('');
    const [model, setModel] = React.useState('');
    const [colour, setColour] = React.useState('');
    const [year, setYear] = React.useState('');

    const editDetailsModal = useRef<HTMLIonModalElement>(null);

    async function getData() {
        const req = await apiAxiosClient.get(`/car/${params.registration}`);
        setCar(req.data);
        setName(req.data.name);
        setMake(req.data.make);
        setModel(req.data.model);
        setColour(req.data.colour);
        setYear(req.data.year);
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <IonPage>
        <IonHeader>
            <IonToolbar>
            <IonTitle>{car && car.name || params.registration}</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
            <IonHeader collapse="condense">
            <IonToolbar>
                <IonTitle size="large">{car && car.name || params.registration}</IonTitle>
                <IonButtons collapse={true} slot="end">
                    <IonButton onClick={() => { history.goBack(); }}>Back</IonButton>
                </IonButtons>
            </IonToolbar>
            </IonHeader>

            <IonList className="list">
                <IonListHeader>
                    <IonLabel className="text-start2">Settings</IonLabel>
                </IonListHeader>
                <IonItem button id="edit-details">
                    <IonLabel>Edit details</IonLabel>
                </IonItem>
                <IonItem button onClick={() => { console.log("delete") }}>
                    <IonLabel color="danger">Delete</IonLabel>
                </IonItem>
            </IonList>

            <IonModal ref={editDetailsModal} trigger="edit-details" initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.75]}>
                <div className="content-top">
                    <IonList>
                        <IonItem>
                            <IonInput
                            placeholder="The QMB"
                            type="text"
                            onIonChange={(e) => setName(e.detail.value || '')}
                            value={name}
                            label="Nickname"
                            />
                        </IonItem>
                        <IonItem>
                            <IonInput
                            placeholder="Tesla"
                            type="text"
                            onIonChange={(e) => setMake(e.detail.value || '')}
                            value={make}
                            label="Make"
                            />
                        </IonItem>
                        <IonItem>
                            <IonInput
                            placeholder="Model 3"
                            type="text"
                            onIonChange={(e) => setModel(e.detail.value || '')}
                            value={model}
                            label="Model"
                            />
                        </IonItem>
                        <IonItem>
                            <IonInput
                            placeholder="White"
                            type="text"
                            onIonChange={(e) => setColour(e.detail.value || '')}
                            value={colour}
                            label="Colour"
                            />
                        </IonItem>
                        <IonItem>
                            <IonInput
                            placeholder="2021"
                            type="text"
                            onIonChange={(e) => setYear(e.detail.value || '')}
                            value={year}
                            label="Year"
                            />
                        </IonItem>
                    </IonList>
                    <IonButton onClick={async () => {
                        await apiAxiosClient.put(`/car/${params.registration}`, {
                            name,
                            make,
                            model,
                            colour,
                            year
                        });
                        editDetailsModal.current?.dismiss();
                        getData();
                    }}>
                        Save
                    </IonButton>
                </div>
            </IonModal>

        </IonContent>
        </IonPage>
    );
};

export default Car;
