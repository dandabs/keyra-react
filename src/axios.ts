import axios from 'axios';
import devEnvironment from './environment.dev';
import { getToken } from './cognitoConfig';

export const genericAxiosClient = axios.create({
    timeout: 1000,
});

export const apiAxiosClient = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? devEnvironment.apiUrl : 'https://api.getkeyra.com',
    timeout: 240000
});

apiAxiosClient.interceptors.request.use(async config => {
    config.headers['Authorization'] = `Bearer ${await getToken()}`;
    return config;
});
