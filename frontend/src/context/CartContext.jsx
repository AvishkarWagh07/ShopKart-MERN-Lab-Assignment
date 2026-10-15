import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  addToCart as addToCartApi,
  getCart,
  removeFromCart as removeFromCartApi,
  updateCartItemQuantity,
} from "../services/api";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoad, setIsLoad] = useState(false);
  const [err, setErr] = useState("");

  const loadData = useCallback(async () => {
    setIsLoad(true);
    setErr("");

    try {
      const res1 = await getCart();
      setItems(res1.data.cart || []);
    } catch (e) {
      // throw the cart away if the fetch breaks
      console.log("cart load err", e);
      setItems([]);
      setErr(e.response?.data?.message || "Unable to load your cart.");
    } finally {
      setIsLoad(false);
    }
  }, []);

  const doAddCart = useCallback(async (pid) => {
    setErr("");
    const res1 = await addToCartApi(pid);
    setItems(res1.data.cart || []);
    return res1;
  }, []);

  const doUpdate = useCallback(async (pid, qty) => {
    setErr("");
    const res1 = await updateCartItemQuantity(pid, { quantity: qty });
    setItems(res1.data.cart || []);
    return res1;
  }, []);

  const doRemove = useCallback(async (pid) => {
    setErr("");
    const res1 = await removeFromCartApi(pid);
    setItems(res1.data.cart || []);
    return res1;
  }, []);

  const doClear = useCallback(() => {
    setErr("");
    setItems([]);
  }, []);

  // add up all the quantities for the little badge
  const count = useMemo(() => {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += Number(items[i].quantity || 0);
    }
    return total;
  }, [items]);

  return (
    <CartCtx.Provider
      value={{
        cartItems: items,
        cartCount: count,
        loading: isLoad,
        error: err,
        setError: setErr,
        refreshCart: loadData,
        addToCart: doAddCart,
        updateCart: doUpdate,
        removeCartItem: doRemove,
        clearCart: doClear,
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);

  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return ctx;
}
