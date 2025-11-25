import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const MEDIA_SERVER_BASE_URL = process.env.MEDIA_SERVER_BASE_URL || 'http://localhost:8000';


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

export { mediaServer };
