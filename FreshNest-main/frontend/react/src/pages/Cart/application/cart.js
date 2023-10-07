import axios from "axios";
import { toast } from "react-toastify";

import appState from "../../../data/AppState";
import { CartItem } from "../../../modals/cart";
import { emitCartUpdateEvent, saveCartCount } from "./cart_event";

/**
 * Get a list of cart items from the database.
 * @returns {Promise<Array<CartItem>>} - The list of items in the cart.
 */
export default async function getCart() {
  if (!appState.isUserLoggedIn()) {
    toast.error("You must be logged in to view your cart");
    return null;
  }

  const id = appState.userData._id;
  const res = await axios.get(import.meta.env.VITE_API_URL + `/cart/get/${id}`);

  console.log("cart.js: ", res);
  emitCartUpdateEvent(res.data.data.items.length);
  saveCartCount(res.data.data.items.length);

  if (!res.data.data.items) {
    console.log("cart.js: An error occurred", res);
    return [];
  }
  return res.data.data.items;
}

/**
 * Add an item to the cart.
 * @param {string} itemId
 * @param {number} count
 * @returns {number} A status code indicating success or failure.
 */
export async function addToCart(itemId, count) {
  if (!appState.isUserLoggedIn()) {
    toast.error("You must be logged in to add item to cart");
    return 0;
  }

  const res = await axios.post(import.meta.env.VITE_API_URL + "/cart/add", {
    userId: appState.userData._id,
    item: itemId,
    count: count,
  });

  if (res.data.statusCode == 200) {
    console.log(res.data.data.items);
    emitCartUpdateEvent(res.data.data.items.length);
    saveCartCount(res.data.data.items.length);

    toast.success(res.data.message);
  } else {
    toast.error(res.data.message);
  }

  console.log(res);
  return 1;
}

/**
 * Remove an item from the cart.
 * @param {string} itemId
 * @returns {number} A status code indicating success or failure.
 */
export async function removeFromCart(itemId) {
  if (!appState.isUserLoggedIn()) {
    toast.error("You must be logged in to remove item from cart");
    return 0;
  }

  const res = await axios.post(import.meta.env.VITE_API_URL + "/cart/remove", {
    userId: appState.userData._id,
    itemId: itemId,
  });

  if (res.data.statusCode == 200) {
    toast.success(res.data.message);
  } else {
    toast.error(res.data.message);
  }

  console.log("cart.js | removeFromCart()", res);
  return 1;
}
