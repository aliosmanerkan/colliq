import axios from "axios";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return "";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      config.baseURL = "";
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default api;
