import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getOrderById } from "../services/api";

function OrderDetails() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [isLoad, setIsLoad] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const getData = async () => {
      setIsLoad(true);
      setErr("");

      try {
        const res1 = await getOrderById(id);
        console.log("order loaded", id);
        setOrderData(res1.data.order);
      } catch (e) {
        setErr(e.response?.data?.message || "Unable to load this order.");
        setOrderData(null);
      } finally {
        setIsLoad(false);
      }
    };

    if (id) {
      getData();
    }
  }, [id]);

  if (isLoad) {
    return (
      <div>
        <Navbar />
        <div className="page">
          <p className="loading">Loading order...</p>
        </div>
      </div>
    );
  }

  if (err || !orderData) {
    return (
      <div>
        <Navbar />
        <div className="page">
          <div className="empty-state">
            <p className="empty">{err || "Order not found."}</p>
            <Link className="button-link" to="/orders">
              My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="page order-detail-shell">
        <div className="order-detail-card">
          <h1>Order #{String(orderData._id).slice(-8)}</h1>
          <p className="muted">
            Placed on {new Date(orderData.createdAt).toLocaleDateString("en-GB")}
          </p>

          <div className="detail-row">
            <span>Total</span>
            <strong>₹{Number(orderData.totalAmount).toLocaleString("en-IN")}</strong>
          </div>

          <div className="detail-row">
            <span>Status</span>
            <span className={`status-pill ${String(orderData.status).toLowerCase()}`}>
              {orderData.status}
            </span>
          </div>

          <div className="detail-row">
            <span>Payment</span>
            <strong>{orderData.paymentStatus}</strong>
          </div>

          <div className="shipping-box">
            <h2>Shipping Address</h2>
            <p>{orderData.shippingAddress?.fullName}</p>
            <p>{orderData.shippingAddress?.addressLine1}</p>
            <p>
              {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} - {orderData.shippingAddress?.pincode}
            </p>
            <p>{orderData.shippingAddress?.phone}</p>
          </div>

          <div className="order-items-list">
            <h2>Items</h2>
            {orderData.items?.map((item) => (
              <div key={`${orderData._id}-${item.product}`} className="order-item-row">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
