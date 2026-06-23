import axios from 'axios';

const BASE_URL = 'https://nfews-backend-production.up.railway.app/api';

export const getReadings = async (district_id = null) => {
  const url = district_id
    ? `${BASE_URL}/sensors/reading.php?district_id=${district_id}`
    : `${BASE_URL}/sensors/reading.php`;
  const response = await axios.get(url);
  return response.data;
};

export const submitReading = async (district_id, level_m) => {
  const response = await axios.post(`${BASE_URL}/sensors/reading.php`, {
    district_id,
    level_m
  });
  return response.data;
};