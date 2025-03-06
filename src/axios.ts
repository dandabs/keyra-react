import axios from 'axios';
import devEnvironment from './environment.dev';
import { getToken } from './cognitoConfig';
import { config } from './config';

export const genericAxiosClient = axios.create({
    timeout: 1000,
});

export const apiAxiosClient = axios.create({
    baseURL: config.apiUrl,
    timeout: 240000
});

apiAxiosClient.interceptors.request.use(async config => {
    config.headers['Authorization'] = `Bearer ${await getToken()}`;
    return config;
});
