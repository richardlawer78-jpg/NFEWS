import axios from 'axios';

const BASE_URL = 'http://localhost/NFEWS/nfews-backend/api';

export const getAllZones = async (country = null) => {
  const url = country
    ? `${BASE_URL}/zones/index.php?country=${country}`
    : `${BASE_URL}/zones/index.php`;
  const response = await axios.get(url);
  return response.data;
};

export const getZoneById = async (id) => {
  const response = await axios.get(`${BASE_URL}/zones/index.php?id=${id}`);
  return response.data;
};