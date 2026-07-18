import axios from "axios";

export const TOKEN_STORAGE_KEY = "controle-familiar:token";

const apiUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !apiUrl) {
  throw new Error(
    "VITE_API_URL nao configurada. Defina essa variavel de ambiente no build de producao " +
    "(ex.: Vercel > Project Settings > Environment Variables) - sem ela a aplicacao tentaria falar com localhost."
  );
}

export const api = axios.create({
  baseURL: apiUrl ?? "https://localhost:7106/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
