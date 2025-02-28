import { Location } from "cordova-background-geolocation-plugin";
import { useDrive } from "./contexts/DriveContext";
import { queryDatabase } from "./databaseHandler";
import { v4 } from "uuid";
import { haversine } from "./utils";
import { apiAxiosClient } from "./axios";
import { Preferences } from "@capacitor/preferences";
import { notify } from "./notificationUtils";

// multipliers
export const
S_TO_MS = 1000;

export const
MINIMUM_DRIVE_START_SPEED = 20 * 0.44704, // a drive will start if motion above this is detected
MINIMUM_DRIVE_PAUSE_SPEED = 10 * 0.44704, // a drive will pause if motion below this is detected for MINIMUM_DRIVE_PAUSE_TIME ms
MINIMUM_DRIVE_PAUSE_TIME = 60 * S_TO_MS,
MINIMUM_DRIVE_STOP_TIME = 300 * S_TO_MS, // a drive will stop if no motion above MINIMUM_DRIVE_START_SPEED is detected for this time in ms
MAXIMUM_DRIVE_SPEED = 100, // the upper limit for a drive to be valid - it will cancel and not save if any point above this
MAXIMUM_STOPPED_SPEED = 1; // the upper limit for a drive to be considered stopped

export async function handleLocationUpdate(
    location: Location,
    setLastPoint: React.Dispatch<React.SetStateAction<Location | null>>,
    setCurrentDrive: React.Dispatch<React.SetStateAction<any | null>>
) {
    console.log(location);
    setLastPoint(location);

    const currentDrive = await getCurrentDrive();
    setCurrentDrive(currentDrive);

    if (!currentDrive) {
        console.log("No current drive, checking if we should start one");
        if (location.speed < MINIMUM_DRIVE_START_SPEED && location.speed < MAXIMUM_DRIVE_SPEED) {
            console.log("Speed below minimum drive start speed, saving for later with ID -1");
            await saveDrivePoint("-1", location)
            return;
        }

        console.log("Speed above minimum drive start speed, starting drive");
        await saveDrivePoint(await startDrive(), location)
        return;
    }

    if (location.speed > MAXIMUM_DRIVE_SPEED) {
        console.log("Speed above maximum drive speed, ending drive without saving");
        endDrive(currentDrive.id, false);
        return;
    }

    if (MINIMUM_DRIVE_STOP_TIME < currentDrive.timeSinceLastPointAboveMinimumDrivePauseSpeed) {
        console.log("Drive stopped for too long, ending drive");
        endDrive(currentDrive.id);
        return;
    }

    if (location.speed < MAXIMUM_STOPPED_SPEED && currentDrive.points.sort((a: any, b: any) => b.timestamp - a.timestamp)[0].speed /* last point */ < MAXIMUM_STOPPED_SPEED) {
        console.log("Current speed and last recorded speed was below maximum stopped speed, not saving to save storage");
        return;
    }

    if (currentDrive.isPaused) {
        console.log("Drive is paused, checking if we should resume");
        if (location.speed > MINIMUM_DRIVE_PAUSE_SPEED) {
            console.log("Speed above minimum drive pause speed, resuming drive");
            resumeDrive();
            saveDrivePoint(currentDrive.id, location)
            return;
        }
        console.log("Speed below minimum drive pause speed, not resuming drive");
        return;
    }

    // if drive is active
    console.log("Drive is active, saving point");

    if (MINIMUM_DRIVE_PAUSE_TIME < currentDrive.timeSinceLastPointAboveMinimumDrivePauseSpeed) {
        console.log("Drive paused for too long, pausing drive");
        pauseDrive();
        return;
    }

    saveDrivePoint(currentDrive.id, location);
}

export async function getCurrentDrive() {
    const points = await queryDatabase(`SELECT * FROM drive_points ORDER BY timestamp DESC`, []);

    if (points.length == 0) {
        console.log("No points found, returning null");
        return null;
    }
    if (points[0].isLastPoint == true) {
        console.log("Last point is marked as last point, returning null");
        return null;
    }
    if (points[0].driveId == "-1") {
        console.log("First point has driveId -1, returning null");
        return null;
    }

    const currentDriveId = points[0].driveId;
    const currentDrivePoints = points.filter((point: any) => point.driveId == currentDriveId);

    const tslp = Date.now() - currentDrivePoints.filter((point: any) => point.speed > MINIMUM_DRIVE_PAUSE_SPEED)[0]?.timestamp;

    const result = {
        id: currentDriveId,
        points: currentDrivePoints,
        isPaused: tslp > MINIMUM_DRIVE_PAUSE_TIME,
        timeSinceLastPointAboveMinimumDrivePauseSpeed: tslp,
        timeElapsed: Date.now() - currentDrivePoints[currentDrivePoints.length - 1].timestamp,
        distanceElapsed: currentDrivePoints.reduce((acc, p, i, arr) => i === 0 ? 0 : acc + haversine(arr[i - 1], p), 0),
        averageSpeed: currentDrivePoints.reduce((acc, p, i, arr) => i === 0 ? 0 : acc + p.speed, 0) / currentDrivePoints.length
    };
    console.log("current drive returned as", result);

    return result;
}

export async function isDriveEnded(driveId: string): Promise<boolean> {
    const points = await queryDatabase(`SELECT * FROM drive_points WHERE driveId = ? AND isLastPoint = 1`, [driveId]);
    if (points.length > 0) {
        return true;
    }
    
    const points2 = await queryDatabase(`SELECT * FROM drive_points WHERE driveId = ? ORDER BY timestamp DESC LIMIT 1`, [driveId]);
    if ((Date.now() - points2.filter((point) => point.speed > MINIMUM_DRIVE_PAUSE_SPEED)[0]?.timestamp) > MINIMUM_DRIVE_STOP_TIME) {
        return true;
    }

    return false;
}

export async function saveDrivePoint(driveId: string, point: Location) {
    await queryDatabase(`INSERT INTO drive_points (driveId, timestamp, latitude, longitude, speed, isLastPoint) VALUES (?, ?, ?, ?, ?, ?)`, [driveId, point.time, point.latitude, point.longitude, point.speed, false]);
}

export async function startDrive(): Promise<string> {
    const id = v4();
    
    await queryDatabase(`
        WITH latest_zero_speed AS (
            SELECT id, timestamp
            FROM drive_points
            WHERE speed = 0
            ORDER BY timestamp DESC
            LIMIT 1
        )
        UPDATE drive_points
        SET driveId = ?
        WHERE timestamp >= (SELECT timestamp FROM latest_zero_speed);
        
        DELETE FROM drive_points
        WHERE speed = 0 AND id NOT IN (
            SELECT id FROM drive_points WHERE driveId = ?
        );
        `, [id, id]);

        notify(`Drive started`, `We've started tracking your drive. Have a safe journey!`);

    return id;
}

export async function pauseDrive() {
    notify(`Drive paused`, `Start moving again to resume, or open the app to manually end the drive`);
}

export async function resumeDrive() {
    notify(`Drive resumed`, `Woop woop! You're back on the road!`);
}

export async function endDrive(driveId: string, save = true) {
    if (save) {
        await queryDatabase(`UPDATE drive_points SET isLastPoint = 1 WHERE driveId = ?`, [driveId]);
        notify(`Drive ended`, `We've stopped your drive, and it's ready to be processed!`);
        syncDrivesToServer();
    } else {
        await queryDatabase(`DELETE FROM drive_points WHERE driveId = ?`, [driveId]);
        notify(`Drive ended`, `We've stopped your drive, but you were moving too fast for it to be saved`);
    }
}

const activeDriveSyncs = new Set<string>();

export async function syncDrivesToServer() {
    const defaultCar = (await Preferences.get({ key: "defaultCar" })).value;
    const fuelCurrency = (await Preferences.get({ key: "fuelCurrency" })).value;
    const fuelPrice = (await Preferences.get({ key: "fuelPrice" })).value;
    if (!defaultCar || !fuelCurrency || !fuelPrice) {
        console.log("Missing preferences, skipping sync.");
        return;
    }
    
    for (const drive of await queryDatabase(`SELECT DISTINCT driveId FROM drive_points`, [])) {
        const driveId = drive.driveId;

        if (activeDriveSyncs.has(driveId)) {
            console.log(`Skipping drive ${driveId}, already syncing.`);
            continue;
        }

        activeDriveSyncs.add(driveId);

        try {
            if (await isDriveEnded(driveId)) {
                const pointsInDrive = await queryDatabase(`SELECT * FROM drive_points WHERE driveId = ?`, [driveId]);
                await apiAxiosClient.post(`/drives`, { points: pointsInDrive, driveId, carId: defaultCar, fuel: { currency: fuelCurrency, price: parseFloat(fuelPrice) } });
                await queryDatabase(`DELETE FROM drive_points WHERE driveId = ?`, [driveId]);
            }
        } catch (e) {
            console.error(`Error syncing drive ${driveId}:`, e);
        } finally {
            // Remove from active syncs after completion (success or error)
            activeDriveSyncs.delete(driveId);
        }
    }
}
