const DEFAULT_LOCAL_API_URL = 'http://localhost:5545/api/v1';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_LOCAL_API_URL;

export const LOCAL_SERVER_PORT = 5545;
