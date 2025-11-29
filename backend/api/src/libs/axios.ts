import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const MEDIA_SERVER_BASE_URL = process.env.MEDIA_SERVER_BASE_URL || 'http://localhost:8000';
const RECOMMENDATION_SERVER_BASE_URL = process.env.RECOMMENDATION_SERVER_BASE_URL || 'http://localhost:8001';

const mediaServer: AxiosInstance = axios.create({
    baseURL: MEDIA_SERVER_BASE_URL,
    timeout: 15_000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

mediaServer.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // You can add custom error handling logic here
        return Promise.reject(error);
    }
);

const recommendationServer: AxiosInstance = axios.create({
    baseURL: RECOMMENDATION_SERVER_BASE_URL,
    timeout: 15_000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

recommendationServer.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // You can add custom error handling logic here
        return Promise.reject(error);
    }
);


export { mediaServer, recommendationServer };
