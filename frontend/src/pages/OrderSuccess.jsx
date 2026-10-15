import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getOrderById } from "../services/api";

function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [isLoad, setIsLoad] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res1 = await getOrderById(id);
        console.log("confirming order", id);
        setOrderData(res1.data.order);
      } catch (e) {
        setOrderData(null);
      } finally {
        setIsLoad(false);
      }
    };

    if (id) {
      getData();
    }
  }, [id]);

  return (
    <div>
      <Navbar />
      <div className="page order-success-shell">
        <div className="success-card">
          {isLoad && <p className="loading">Confirming your order...</p>}

          {!isLoad && orderData && (
            <>
              <h1>Order Placed Successfully</h1>
              <p>
                <strong>Order ID:</strong> {String(orderData._id).slice(-8)}
              </p>
              <p>
                <strong>Total:</strong> ₹{Number(orderData.totalAmount).toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Status:</strong> {orderData.status}
              </p>
              <p>Your order has been saved successfully.</p>
              <div className="success-actions">
                <button type="button" onClick={() => navigate(`/orders/${orderData._id}`)}>
                  View My Orders
                </button>
                <button type="button" className="secondary-button" onClick={() => navigate("/products")}>
                  Continue Shopping
                </button>
              </div>
            </>
          )}

          {!isLoad && !orderData && (
            <div className="empty-state">
              <p className="empty">Unable to confirm the order.</p>
              <Link className="button-link" to="/orders">
                View My Orders
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
