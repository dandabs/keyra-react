import { LocalNotifications } from '@capacitor/local-notifications';

export async function notify(title: string, body: string, at = new Date(Date.now() + 1000)) {
    await LocalNotifications.schedule({
        notifications: [
            {
                title,
                body,
                id: at.getTime(),
                schedule: { at },
                silent: false,
            }
        ]
    });
}
