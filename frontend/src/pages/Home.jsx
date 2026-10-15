import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoad, setIsLoad] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res1 = await api.get("/customers/me");
        console.log("hello", res1.data?.fullName);
        setUser(res1.data);
      } catch (err) {
        // not logged in, push them to login
        navigate("/login");
      } finally {
        setIsLoad(false);
      }
    };

    loadData();
  }, [navigate]);

  if (isLoad) {
    return <p className="loading">Loading...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className="page home">
        <section className="hero">
          <h1>Hello, {user.fullName}</h1>
          <p>Welcome back to ShopKart. What are you shopping for today?</p>
        </section>

        <div className="home-grid">
          <Link className="home-tile" to="/products">
            <h3>Shop Products</h3>
            <p>Browse the full catalogue</p>
            <span className="tile-link">See all products</span>
          </Link>

          <Link className="home-tile" to="/wishlist">
            <h3>My Wishlist</h3>
            <p>Products you saved for later</p>
            <span className="tile-link">Open wishlist</span>
          </Link>

          <Link className="home-tile" to="/cart">
            <h3>My Cart</h3>
            <p>Review items before checkout</p>
            <span className="tile-link">Go to cart</span>
          </Link>

          <Link className="home-tile" to="/orders">
            <h3>My Orders</h3>
            <p>Track your past purchases</p>
            <span className="tile-link">View orders</span>
          </Link>
        </div>

        <div className="card" style={{ marginTop: "28px", maxWidth: "100%" }}>
          <h1>My Account</h1>
          <p>
            <strong>Name:</strong> {user.fullName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
