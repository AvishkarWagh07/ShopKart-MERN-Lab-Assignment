import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useCart } from "../context/CartContext.jsx";
import { getProductById } from "../services/api";

function ProductDetails() {
  const { id } = useParams();
  const [prod, setProd] = useState(null);
  const [isLoad, setIsLoad] = useState(true);
  const [err, setErr] = useState("");
  const [isAdd, setIsAdd] = useState(false);
  const { addToCart, cartItems } = useCart();

  const inCart = prod
    ? cartItems.some(
        (item) =>
          item.product?._id === prod._id || item.product === prod._id,
      )
    : false;

  useEffect(() => {
    const getData = async () => {
      setIsLoad(true);
      setErr("");

      try {
        const res1 = await getProductById(id);
        setProd(res1.data);
      } catch (e) {
        setErr("Something went wrong while loading products.");
        setProd(null);
      } finally {
        setIsLoad(false);
      }
    };

    getData();
  }, [id]);

  const addItem = async () => {
    if (!prod || prod.stock <= 0 || isAdd) return;

    setIsAdd(true);
    try {
      console.log("adding to cart", prod._id);
      await addToCart(prod._id);
    } catch (e) {
      setErr(e.response?.data?.message || "Unable to add product to cart.");
    } finally {
      setIsAdd(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page catalog">
        {isLoad && <p className="loading">Loading products...</p>}

        {!isLoad && err && <p className="error">{err}</p>}

        {!isLoad && !err && !prod && (
          <p className="empty">No products found.</p>
        )}

        {!isLoad && !err && prod && (
          <div className="details">
            <img src={prod.image} alt={prod.name} />
            <div>
              <h1>{prod.name}</h1>
              <p className="muted">{prod.category}</p>
              <p>{prod.description}</p>
              <p className="price">₹{prod.price.toLocaleString("en-IN")}</p>
              <p>
                {prod.stock > 0
                  ? `${prod.stock} units left`
                  : "Out of stock"}
              </p>
              <button
                type="button"
                onClick={addItem}
                disabled={isAdd || prod.stock <= 0}
              >
                {prod.stock <= 0
                  ? "Out of stock"
                  : isAdd
                    ? "Adding..."
                    : inCart
                      ? "Add Another"
                      : "Add to Cart"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
