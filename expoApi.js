// apiService.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const sendPushNotification = async (expoPushToken, notificationTitle, notificationMessage) => {
  try {

    const response = await axios.post(`${API_BASE_URL}/send-notification`,
    {
        pushTokens: expoPushToken,
        notificationTitle,
        notificationMessage,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
