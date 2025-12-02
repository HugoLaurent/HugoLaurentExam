// src/services/api.js
import axios from "axios";

// Use backend URL from env when provided; fallback to deployed backend so prod still works
const API_BASE_URL = `${
  process.env.REACT_APP_API_URL || "https://hugolaurentexam.onrender.com"
}/api`;

export const fetchProducts = () => axios.get(`${API_BASE_URL}/products`);

export const createOrder = (orderData) => {
  console.log(
    `appel fonction createOrder avec orderData ${JSON.stringify(orderData)}`
  );
  const token = localStorage.getItem("token"); // Token de connexion
  console.log(`token is ${token}`);
  return axios.post(`${API_BASE_URL}/orders`, orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
