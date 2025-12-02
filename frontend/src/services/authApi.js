import axios from "axios";

const API_BASE_URL = `${
  process.env.REACT_APP_API_URL || "https://hugolaurentexam.onrender.com"
}/api`;
axios.defaults.withCredentials = true;

export const login = (credentials) =>
  axios.post(`${API_BASE_URL}/auth/login`, credentials, {
    withCredentials: true,
  });

export const register = (payload) =>
  axios.post(`${API_BASE_URL}/auth/register`, payload, {
    withCredentials: true,
  });

export const getCurrentUser = () =>
  axios.get(`${API_BASE_URL}/auth/me`, { withCredentials: true });

export const logout = () =>
  axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
