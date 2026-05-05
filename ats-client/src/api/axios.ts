import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://localhost:7001/api";

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("ats_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global response error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("ats_token");
            localStorage.removeItem("ats_user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default apiClient;