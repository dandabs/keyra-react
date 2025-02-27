import React, { RefObject, useEffect, useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonContent, IonFooter, IonHeader, IonInput, IonItem, IonList, IonModal, IonPage, IonTitle, IonToolbar, useIonLoading, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { useHistory, useParams } from 'react-router';
import { apiAxiosClient } from '../../axios';
import { MapContainer, TileLayer, Polyline, MapContainerProps, useMap, Marker, Popup } from "react-leaflet";
import { LatLngExpression, Map } from 'leaflet';
import L from "leaflet";
import { Preferences } from '@capacitor/preferences';
import { formatCurrency, msToKmh, msToKmhLabel, msToMph, msToMphLabel, mToKm, mToMi } from '../../utils';
import { useProfile } from '../../contexts/ProfileContext';

const FitBounds = ({ points }: { points: { latitude: number; longitude: number }[] }) => {
    const map = useMap();

    useEffect(() => {
        if (points.length > 0) {
        const bounds = L.latLngBounds(points.map(p => [p.latitude, p.longitude]));
        map.fitBounds(bounds, { padding: [10, 10] });
        }
    }, [map, points]);

    return null;
};

const startIcon = new L.DivIcon({
    className: "custom-icon",
    html: '<div style="background-color: var(--ion-color-primary); color: white; border: 3px solid white; border-radius: 50%; width: 35px; height: 35px; text-align: center; line-height: 30px; font-weight: bold;">A</div>',
    iconSize: [30, 30],
});

const endIcon = new L.DivIcon({
    className: "custom-icon",
    html: '<div style="background-color: var(--ion-color-primary); color: white; border: 3px solid white; border-radius: 50%; width: 35px; height: 35px; text-align: center; line-height: 30px; font-weight: bold;">B</div>',
    iconSize: [30, 30],
});

const speedIcon = (speed: number) => new L.DivIcon({
    className: "custom-icon",
    html: `<div style="background-color: var(--ion-color-warning); color: black; border: 4px solid var(--ion-color-danger); border-radius: 50%; width: 35px; height: 35px; text-align: center; display: flex; justify-content: center; align-items: center; font-weight: bold;">${Math.round(speed)}</div>`,
    iconSize: [30, 30],
});

const detectSpeedingSegments = (drive: any) => {
    const speedingSegments = [];
    let segmentStart = null;
    let segmentSpeed = 0;
    let segmentSpeedLimit = 0;

    for (let i = 0; i < drive.points.length - 1; i++) {
        const point = drive.points[i];
        
        if (point.speed && point.speedLimit && point.speed > point.speedLimit) {
            if (!segmentStart) segmentStart = i;  // Start of a speeding segment
            if (point.speed > segmentSpeed) segmentSpeed = point.speed;

            if (point.speedLimit != segmentSpeedLimit) {
                // different speed zone entered, but still speedinmg
                speedingSegments.push([segmentStart, i, segmentSpeed, segmentSpeedLimit]);
                segmentStart = i;  // New speeding segment
            }

            segmentSpeedLimit = point.speedLimit;
        } else {
            if (segmentStart !== null) {
                speedingSegments.push([segmentStart, i, segmentSpeed, segmentSpeedLimit]);
                segmentStart = null;  // End of the speeding segment
            }
        }
    }

    // If the last point is part of a speeding segment
    if (segmentStart !== null) {
        speedingSegments.push([segmentStart, drive.points.length - 1]);
    }

    return speedingSegments;
};

const DriveView: React.FC = () => {
    const history = useHistory();
    const [present, dismiss] = useIonLoading();

    const { driveId } = useParams() as { driveId: string };
    const [drive, setDrive] = useState<any>();

    const [showModal, setShowModal] = useState(false);

    const { numberSystem, setNumberSystem } = useProfile()!;

    const mapRef = React.useRef<Map>(null);

    async function getData() {
        const response = await apiAxiosClient.get(`/drives/${driveId}`);
        setDrive(response.data);
    }

    useEffect(() => {
        getData();
    }, []);

    useIonViewWillEnter(() => {
        mapRef.current?.invalidateSize();
        setShowModal(true);
    });

    useIonViewWillLeave(() => {
        setShowModal(false);
    })

    const speedingSegments = drive ? detectSpeedingSegments(drive) : [];

    return (
        <IonPage>
        <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
            <IonBackButton>Back</IonBackButton>
            </IonButtons>
        </IonToolbar>
        </IonHeader>

        <IonContent>

            <div style={{ width: '100vw', height: '85%', display: 'flex', flex: 1, flexGrow: 1 }}>
                <MapContainer style={{ flexGrow: 1, width: '100vw' }} center={[51.505, -0.09]} zoom={10} scrollWheelZoom={true} ref={mapRef}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {
                        drive &&
                        <>
                        <FitBounds points={drive.points} />

                        {drive.points.slice(0, -1).map((point: any, index: number) => {
                            const nextPoint = drive.points[index + 1];
                            if (!nextPoint) return null;

                            const segment: LatLngExpression[] = [
                            [point.latitude, point.longitude],
                            [nextPoint.latitude, nextPoint.longitude],
                            ];

                            let isOverSpeed = false;

                            if (point.speed &&
                                point.speedLimit &&
                                point.speed > point.speedLimit) isOverSpeed = true;

                            if (!isOverSpeed) console.log("not over speed");

                            return (
                            <Polyline
                                key={index}
                                positions={segment}
                                color={isOverSpeed ? "red" : "blue"}
                                weight={4}
                            />
                            );
                        })}

                        <Marker position={[drive.points[0].latitude, drive.points[0].longitude]} icon={startIcon}>
                            <Popup>{drive.from}</Popup>
                        </Marker>
                        <Marker position={[drive.points[drive.points.length - 1].latitude, drive.points[drive.points.length - 1].longitude]} icon={endIcon}>
                            <Popup>{drive.to}</Popup>
                        </Marker>

                        {speedingSegments.map((segment: any, index: number) => {
                            const startPoint = drive.points[segment[0]];

                            if (!segment[2] || segment[3] == 0) return null;
                            console.log(segment);

                            return (
                                <React.Fragment key={index}>
                                    <Marker position={[startPoint.latitude, startPoint.longitude]} icon={speedIcon(numberSystem == 'metric' ? msToKmh(segment[2]) : msToMph(segment[2]))}>
                                        <Popup>
                                            Speeding{' '}
                                            {numberSystem == 'metric' ? msToKmhLabel(segment[2]) : msToMphLabel(segment[2])}{' '}
                                            in{' '}
                                            {numberSystem == 'metric' ? msToKmhLabel(segment[3]) : msToMphLabel(segment[3])}{' '}
                                            zone</Popup>
                                    </Marker>
                                </React.Fragment>
                            );
                        })}
                        </>
                    }
                    
                </MapContainer>
            </div>

        </IonContent>

            <IonModal
                isOpen={showModal}
                initialBreakpoint={0.5}
                breakpoints={[0.25, 0.5, 0.75]}
                backdropDismiss={false}
                backdropBreakpoint={0.5}>
                    {
                        drive &&
                        <IonContent>
                        <div className="content-top">
                            
                            <IonCard className="rural-sign-card" style={{ marginBottom: '0', marginTop: '5px' }}>
                                <div className="rural-sign-card--container-x-small" style={{ paddingBottom: 0 }}>
                                    <span style={{ flexGrow: 1, paddingLeft: '5px', paddingRight: '10px' }}>{drive.from.split(',')[0]}</span>
                                    <span style={{ paddingLeft: '10px', paddingRight: '5px' }}>{ 0 }</span>
                                </div>
                                <div className="rural-sign-card--container-x-small">
                                    <span style={{ flexGrow: 1, paddingLeft: '5px', paddingRight: '10px' }}>{drive.to.split(',')[0]}</span>
                                    <span style={{ paddingLeft: '10px', paddingRight: '5px' }}>{ numberSystem == 'metric' ? Math.round(mToKm(drive.distance)) : Math.round(mToMi(drive.distance)) }</span>
                                </div>
                            </IonCard>

                            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', rowGap: '5px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="speed-sign">
                                        <span>{
                                        numberSystem == 'metric' ?
                                        Math.round(msToKmh(drive.averageSpeed))
                                        :
                                        Math.round(msToMph(drive.averageSpeed))
                                        }</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="fuel-card--price" style={{ fontSize: '3rem' }}>
                                        {formatCurrency((drive.distance * 0.0006213712) / drive.efficiencyMpg * (4.54609 * drive.fuel.price), drive.fuel.currency).replace('£', '')}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="speed-sign">
                                        <span>{
                                        numberSystem == 'metric' ?
                                        Math.round(msToKmh(drive.topSpeed))
                                        :
                                        Math.round(msToMph(drive.topSpeed))
                                        }</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <span>Average speed</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <span>Estimated<br/>cost</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <span>Highest speed</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '15px', textAlign: 'center' }}>
                                <div >
                                    
                                    
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0' }}>
                                    
                                    
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0' }}>
                                    
                                    
                                </div>
                            </div>

                        </div>
                    </IonContent>
                    }
            </IonModal>
        </IonPage>
    );
};

export default DriveView;
