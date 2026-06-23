import axios from 'axios';

const BASE_URL = 'https://nfews-backend-production.up.railway.app/api';

export const getAlerts = async () => {
  const response = await axios.get(`${BASE_URL}/alerts/index.php`);
  return response.data;
};

export const createAlert = async (alertData) => {
  const response = await axios.post(`${BASE_URL}/alerts/index.php`, alertData);
  return response.data;
};