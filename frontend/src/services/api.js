// src/services/api.js
import axios from "axios";

// Use backend URL from env when provided; fallback to deployed backend so prod still works
const API_BASE_URL = `${
  process.env.REACT_APP_API_URL || "https://hugolaurentexam.onrender.com"
}/api`;
axios.defaults.withCredentials = true;

export const fetchProducts = () => axios.get(`${API_BASE_URL}/products`);

export const createOrder = (orderData) => {
  return axios.post(`${API_BASE_URL}/orders`, orderData, {
    withCredentials: true,
  });
};
