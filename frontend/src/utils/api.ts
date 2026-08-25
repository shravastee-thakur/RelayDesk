import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

const PUBLIC_ENDPOINTS = [
  "/users/", // register
  "/users/otp-requests", // send OTP
  "/users/sessions", // verify OTP + login
];

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

    // Never refresh for auth endpoints - they handle their own errors
    if (PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint))) {
      return Promise.reject(error);
    }

    // Only try refresh once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use raw axios - bypasses interceptors, no infinite loop
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/tokens`,
          {},
          { withCredentials: true },
        );

        // Just update the token
        useAuthStore.getState().setAccessToken(res.data.accessToken);
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

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
// Store loads user and isAuthenticated: true from localStorage
// First API call gets 401 (no token in memory)
// Interceptor refreshes token
// Request succeeds
// User sees no interruption.
