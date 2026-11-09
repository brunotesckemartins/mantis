// mobile/src/api/client.ts
import axios from 'axios';
import * as SecureStore from './secureStore';

const api = axios.create({
  baseURL: 'http://localhost:3000', 
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('mantis_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;