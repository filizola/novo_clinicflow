import axios from 'axios';

// Use relative path if REACT_APP_BACKEND_URL is not set (works in any environment)
const API_URL = process.env.REACT_APP_BACKEND_URL 
  ? process.env.REACT_APP_BACKEND_URL + '/api'
  : '/api';

const api = axios.create({
  baseURL: API_URL,
});

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function shouldSkipAuth(config) {
  const url = String(config?.url || "");
  return url.includes("/auth/login") || url.includes("/auth/register");
}

// Add token to requests
api.interceptors.request.use((config) => {
  if (shouldSkipAuth(config)) return config;
  const token = localStorage.getItem('token');
  if (token) {
    const payload = decodeJwtPayload(token);
    const exp = payload?.exp;
    if (!payload || (typeof exp === "number" && exp * 1000 <= Date.now())) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return config;
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirecionar para login apenas se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
