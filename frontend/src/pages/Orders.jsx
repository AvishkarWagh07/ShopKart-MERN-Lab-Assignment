import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getOrders } from "../services/api";

function Orders() {
  const navigate = useNavigate();
  const [orderList, setOrderList] = useState([]);
  const [isLoad, setIsLoad] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const getData = async () => {
      setIsLoad(true);
      setErr("");

      try {
        const res1 = await getOrders();
        console.log("loaded orders", res1.data.orders?.length);
        setOrderList(res1.data.orders || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Unable to load your orders.");
        setOrderList([]);
      } finally {
        setIsLoad(false);
      }
    };

    getData();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page orders-page-shell">
        <div className="orders-page">
          <h1>My Orders</h1>

          {isLoad && <p className="loading">Loading your orders...</p>}

          {!isLoad && err && <p className="error">{err}</p>}

          {!isLoad && !err && orderList.length === 0 && (
            <div className="empty-state">
              <p className="empty">You have not placed any orders yet.</p>
              <Link className="button-link" to="/products">
                Start Shopping
              </Link>
            </div>
          )}

          {!isLoad && !err && orderList.length > 0 && (
            <div className="order-list">
              {orderList.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-meta">
                    <h2>Order #{String(order._id).slice(-8)}</h2>
                    <p>{new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
                  </div>

                  <div className="order-items-preview">
                    {order.items?.slice(0, 2).map((item) => (
                      <p key={`${order._id}-${item.product}`}>
                        {item.name} × {item.quantity}
                      </p>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div>
                      <p>Total: ₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                      <p>
                        Status:{" "}
                        <span className={`status-pill ${String(order.status).toLowerCase()}`}>
                          {order.status}
                        </span>
                      </p>
                    </div>
                    <button type="button" onClick={() => navigate(`/orders/${order._id}`)}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;
