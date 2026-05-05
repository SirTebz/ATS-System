import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
    console.error(
        "[axios] VITE_API_URL is not set. Check your .env file."
    );
}

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
});

// Attach JWT token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("ats_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Global response error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === "ERR_NETWORK") {
            console.error(
                `[axios] Network error — is the backend running at ${BASE_URL}?`
            );
        }
        if (error.response?.status === 401) {
            localStorage.removeItem("ats_token");
            localStorage.removeItem("ats_user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default apiClient;