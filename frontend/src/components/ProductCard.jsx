import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { addToWishlist } from "../services/api";

function ProductCard({ product }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [msg, setMsg] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart: addItem, cartItems: items } = useCart();

  const already = items.some(
    (it) => it.product?._id === product._id || it.product === product._id,
  );

  const saveWish = async () => {
    if (isSaving || isSaved) return;

    setIsSaving(true);
    setMsg("");
    try {
      await addToWishlist(product._id);
      setIsSaved(true);
    } catch (err) {
      console.log("wishlist save failed", err);
      setMsg(
        err.response?.data?.message ||
          "Unable to save product. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addCart = async () => {
    // dont bother if already adding or none left
    if (isAdding || product.stock <= 0) return;

    setIsAdding(true);
    setMsg("");

    try {
      await addItem(product._id);
    } catch (err) {
      setMsg(err.response?.data?.message || "Unable to add product to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-card-body">
        <h2>{product.name}</h2>
        <p className="muted">{product.category}</p>
        <p className="price">₹{product.price.toLocaleString("en-IN")}</p>
        <p>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>
        <Link to={`/products/${product._id}`}>View Details</Link>
        <button
          type="button"
          onClick={addCart}
          disabled={isAdding || product.stock <= 0}
        >
          {product.stock <= 0
            ? "Out of stock"
            : isAdding
              ? "Adding..."
              : already
                ? "Add Another"
                : "Add to Cart"}
        </button>
        <button type="button" onClick={saveWish} disabled={isSaving || isSaved}>
          {isSaving
            ? "Saving..."
            : isSaved
              ? "Added to Wishlist"
              : "Add to Wishlist"}
        </button>
        {msg && <p className="error">{msg}</p>}
      </div>
    </article>
  );
}

export default ProductCard;
