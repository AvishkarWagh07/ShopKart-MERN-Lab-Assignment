import { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../services/api";

function Navbar() {
  const nav = useNavigate();
  // pull cart count fresh, then we show it next to Cart
  const { cartCount: count, refreshCart: pullCart } = useCart();

  useEffect(() => {
    pullCart();
  }, [pullCart]);

  const doLogout = async () => {
    try {
      await api.post("/customers/logout");
    } catch (err) {
      // if logout fails whatever, just send them to login anyway
      console.log("logout didnt work", err);
    }
    nav("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/home" className="logo">
        ShopKart<span className="logo-dot">.in</span>
      </Link>
      <div className="nav-links">
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/wishlist">Wishlist</NavLink>
        <NavLink to="/cart">
          Cart
          {count > 0 && <span className="cart-count">{count}</span>}
        </NavLink>
        <NavLink to="/orders">My Orders</NavLink>
        <button type="button" onClick={doLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
