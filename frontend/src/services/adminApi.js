import axios from "axios";

const API_BASE_URL = `${
  process.env.REACT_APP_API_URL || "https://hugolaurentexam.onrender.com"
}/api`;
axios.defaults.withCredentials = true;

export const getOrders = () => {
  try {
    return axios.get(`${API_BASE_URL}/orders`, { withCredentials: true });
  } catch (error) {
    console.error("Erreur lors de la recuperation des commandes :", error);
    throw error;
  }
};

export const getProducts = () => {
  try {
    return axios.get(`${API_BASE_URL}/products`, { withCredentials: true });
  } catch (error) {
    console.error("Erreur lors de la recuperation des produits :", error);
    throw error;
  }
};

export const updateOrderStatus = (orderId, status) => {
  try {
    return axios.put(
      `${API_BASE_URL}/orders/${orderId}/status`,
      { status },
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la mise a jour du statut de la commande :",
      error
    );
    throw error;
  }
};

export const validateOrder = (orderId) => {
  try {
    return axios.put(
      `${API_BASE_URL}/orders/${orderId}/validate`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error("Erreur lors de la validation de la commande :", error);
    throw error;
  }
};

export const updateProductStock = (productId, stock) => {
  try {
    return axios.put(
      `${API_BASE_URL}/products/${productId}/stock`,
      { stock },
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error("Erreur lors de la mise a jour du stock :", error);
    throw error;
  }
};
