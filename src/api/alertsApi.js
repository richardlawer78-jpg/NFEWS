import axios from 'axios';

const BASE_URL = 'http://localhost/NFEWS/nfews-backend/api';

export const getAlerts = async () => {
  const response = await axios.get(`${BASE_URL}/alerts/index.php`);
  return response.data;
};

export const createAlert = async (alertData) => {
  const response = await axios.post(`${BASE_URL}/alerts/index.php`, alertData);
  return response.data;
};