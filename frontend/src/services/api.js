import axios from "axios";

// all our requests go through this one instance so cookies are sent too
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export const getProducts = (p) => api.get("/products", { params: p });

export const getProductById = (id) => api.get(`/products/${id}`);
export const getWishlist = () => api.get("/wishlist");
export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);
export const removeFromWishlist = (productId) =>
  api.delete(`/wishlist/${productId}`);

export const getCart = () => api.get("/cart");
export const addToCart = (productId) => api.post(`/cart/${productId}`);
export const updateCartItemQuantity = (productId, data) =>
  api.patch(`/cart/${productId}`, data);
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

// order + payment stuff
export const createPaymentOrder = (addr) =>
  api.post("/orders/create-payment-order", addr);
export const verifyPayment = (payload) => api.post("/orders/verify-payment", payload);
export const getOrders = () => api.get("/orders");
export const getOrderById = (id) => api.get(`/orders/${id}`);

console.log("api base url is", api.defaults.baseURL);

export default api;
