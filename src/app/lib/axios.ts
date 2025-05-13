import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const backend = process.env.NEXT_PUBLIC_BACKEND || 'not set';

const axiosInstance = axios.create({
  baseURL: backend,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 