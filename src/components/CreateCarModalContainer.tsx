import { IonList, IonItem, IonInput, IonButton } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { britishRegistrationPlate, icelandicRegistrationPlate } from '../regExp';
import { toSentenceCase } from '../util';
import { apiAxiosClient, genericAxiosClient } from '../axios';
import { AxiosError } from 'axios';

const CreateCarModalContainer: React.FC = () => {
    const history = useHistory();

    const [registration, setRegistration] = useState('');
    const [registrationError, setRegistrationError] = useState('');

    const [isDataFromApi, setIsDataFromApi] = useState(true);

    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [colour, setColour] = useState('');
    const [year, setYear] = useState('');

    useEffect(() => {
        async function doCheckRegistration() {
            if (registration.trim() === '') {
                setRegistrationError('Registration cannot be empty.');
                return;
            } else setRegistrationError('');

            if (icelandicRegistrationPlate.test(registration)) {
                const req = await fetch(`https://island.is/api/graphql?operationName=GetPublicVehicleSearch&variables={"input":{"search":"${registration}"}}&extensions={"persistedQuery":{"version":1,"sha256Hash":"b04f6f91c746425e2b15966df336f47814b94a0642bfbf6fa3ad7bdd8d3c80e5"}}`)
                const { data: data } = await req.json();
                const vehicle = data.getPublicVehicleSearch;
                if (vehicle) {
                    setIsDataFromApi(true);
                    setMake(toSentenceCase(vehicle.make));
                    setModel(toSentenceCase(vehicle.vehicleCommercialName));
                    setColour(toSentenceCase(vehicle.color));
                    setYear(new Date(vehicle.firstRegDate).getFullYear().toString());
                    return;
                }
            }
    
            if (britishRegistrationPlate.test(registration)) {
                try {
                    const data = await apiAxiosClient.get(`/dvla/${registration}`);
                    setIsDataFromApi(true);
                    setMake(toSentenceCase(data.data.make || ''));
                    setModel('')
                    setColour(toSentenceCase(data.data.colour || ''));
                    setYear(toSentenceCase(data.data.yearOfManufacture.toString() || ''));
                    return;
                } catch (e) { console.log(e); }
            }
    
            setIsDataFromApi(false);
        }
        doCheckRegistration();
    }, [registration]);

    async function createCar() {
        try {
            await apiAxiosClient.post(`/car`, {
                registration,
                make,
                model,
                colour,
                year
            });
            history.push(`/tabs/profile/cars/${registration}`);
        } catch (e) {
            setRegistrationError(e as any);
        }
    }
    
  return (
    <div className="content-top">
        <h1>Create a car</h1>

        <IonList>
            <IonItem>
                <IonInput
                placeholder="RVE42"
                type="text"
                onIonChange={(e) => setRegistration(e.detail.value || '')}
                value={registration}
                label="Registration Plate"
                errorText={registrationError}
                className={`${!registrationError && 'ion-valid'} ${registrationError && 'ion-invalid'} ${registrationError && 'ion-touched'}`}
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
                placeholder="2023"
                type="number"
                onIonChange={(e) => setYear(e.detail.value || '')}
                value={year}
                label="Year"
                />
            </IonItem>
        </IonList>
        <IonButton onClick={createCar}>
            Create
        </IonButton>
    </div>
  );
};

export default CreateCarModalContainer;
