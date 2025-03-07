import PushNotificationIOS from '@react-native-community/push-notification-ios';

const navigateToScreen = async () => {
  try {
    const initialNotification = await PushNotificationIOS.getInitialNotification();

    if (initialNotification?._data?.screen) {
      return initialNotification._data.screen;
    }

    return new Promise((resolve) => {
      const localNotificationListener = (notification) => {
        if (notification?._data?.screen) {
          resolve(notification._data.screen);

          // Remove the event listener after it has served its purpose
          PushNotificationIOS.removeEventListener('localNotification', localNotificationListener);
        }
      };

      // Add the event listener
      PushNotificationIOS.addEventListener('localNotification', localNotificationListener);
    });
  } catch (error) {
    console.error('Error while navigating:', error);
  }

  return null;
};

export default navigateToScreen;
