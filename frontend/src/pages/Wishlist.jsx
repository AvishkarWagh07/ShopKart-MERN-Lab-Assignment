import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getWishlist, removeFromWishlist } from "../services/api";

function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoad, setIsLoad] = useState(true);
  const [err, setErr] = useState("");
  const [removing, setRemoving] = useState("");

  const getData = useCallback(async () => {
    setIsLoad(true);
    setErr("");
    try {
      const res1 = await getWishlist();
      console.log("wishlist loaded", res1.data.wishlist?.length);
      setItems(res1.data.wishlist);
    } catch (e) {
      if (e.response?.status === 401) {
        navigate("/login");
        return;
      }
      setErr("Unable to load wishlist.");
    } finally {
      setIsLoad(false);
    }
  }, [navigate]);

  useEffect(() => {
    getData();
  }, [getData]);

  const doRemove = async (pid) => {
    setRemoving(pid);
    try {
      await removeFromWishlist(pid);
      setItems((prev) => prev.filter((p) => p._id !== pid));
    } catch (e) {
      setErr(e.response?.data?.message || "Unable to remove product.");
    } finally {
      setRemoving("");
    }
  };

  return (
    <div>
      <Navbar />
      <main className="page catalog">
        <h1>My Wishlist</h1>
        {isLoad && <p className="loading">Loading your wishlist...</p>}
        {!isLoad && err && (
          <div>
            <p className="error">{err}</p>
            <button type="button" onClick={getData}>
              Try Again
            </button>
          </div>
        )}
        {!isLoad && !err && items.length === 0 && (
          <div className="empty-state">
            <p className="empty">Your wishlist is empty</p>
            <p>Start saving products you love.</p>
            <Link className="button-link" to="/products">
              Browse Products
            </Link>
          </div>
        )}
        {!isLoad && !err && items.length > 0 && (
          <div>
            <p>
              {items.length} product{items.length === 1 ? "" : "s"} saved
            </p>
            <div className="product-grid">
              {items.map((p) => (
                <article className="product-card" key={p._id}>
                  <img src={p.image} alt={p.name} />
                  <div className="product-card-body">
                    <h2>{p.name}</h2>
                    <p className="muted">{p.category}</p>
                    <p className="price">
                      ₹{p.price.toLocaleString("en-IN")}
                    </p>
                    <p>
                      {p.stock > 0
                        ? `${p.stock} units left`
                        : "Out of stock"}
                    </p>
                    <Link to={`/products/${p._id}`}>View Details</Link>
                    <button
                      type="button"
                      onClick={() => doRemove(p._id)}
                      disabled={removing === p._id}
                    >
                      {removing === p._id
                        ? "Removing..."
                        : "Remove from Wishlist"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Wishlist;
