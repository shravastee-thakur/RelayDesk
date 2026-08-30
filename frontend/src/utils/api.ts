import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

const REFRESH_URL = `${import.meta.env.VITE_BACKEND_URL}/api/users/tokens`;

const PUBLIC_ENDPOINTS = [
  "/users/", // register
  "/users/otp-requests", // send OTP
  "/users/sessions", // verify OTP + login
  "/api/users/tokens",
];

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(REFRESH_URL, {}, { withCredentials: true })
      .then((res) => {
        const newToken = res.data.accessToken;

        // Just update the token
        useAuthStore.getState().setAccessToken(newToken);
        return newToken;
      })
      .catch((err) => {
        refreshPromise = null;
        throw err;
      });
  }

  return refreshPromise;
};
// Attach token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors by refreshing token
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Never refresh for auth endpoints - they handle their own errors
    if (PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint))) {
      return Promise.reject(error);
    }

    // Only try refresh once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — kick to login
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

/*

Request sent
    │
    ├─ Has token? → Attach to header → Send
    │
    └─ No token? → Just send (will likely get 401)


Response received
    │
    ├─ Success? → Return it
    │
    └─ 401 error?
         │
         ├─ First time? → Try refresh endpoint
         │                   │
         │                   ├─ Refresh works? → Save new token → Retry request
         │                   │
         │                   └─ Refresh fails? → Logout → Redirect to login
         │
         └─ Already retried? → Just fail (avoid infinite loop)

*/
