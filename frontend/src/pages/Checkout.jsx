import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useCart } from "../context/CartContext.jsx";
import { createPaymentOrder, verifyPayment } from "../services/api";

const emptyForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

const loadScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay."));
    document.body.appendChild(script);
  });

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartCount, loading, refreshCart, clearCart } = useCart();
  const [form1, setForm1] = useState(emptyForm);
  const [fieldErr, setFieldErr] = useState({});
  const [isPay, setIsPay] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    // if cart empty just send back to cart page
    if (!loading && cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, loading, navigate]);

  const total = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < cartItems.length; i++) {
      const it = cartItems[i];
      sum = sum + Number(it.product?.price || 0) * Number(it.quantity || 0);
    }
    return sum;
  }, [cartItems]);

  const doChange = (e) => {
    const { name, value } = e.target;
    setForm1((prev) => ({ ...prev, [name]: value }));
    setFieldErr((prev) => ({ ...prev, [name]: "" }));
  };

  const checkForm = () => {
    const errs = {};

    Object.entries(form1).forEach(([key, value]) => {
      const val = String(value).trim();
      if (!val) {
        errs[key] = "This field is required.";
      }
    });

    // small check on phone
    if (form1.phone && !/^[0-9+\-\s()]{10,15}$/.test(form1.phone.trim())) {
      errs.phone = "Phone number is invalid.";
    }

    // pincode should be 6 digits
    if (form1.pincode && !/^\d{6}$/.test(form1.pincode.trim())) {
      errs.pincode = "Pincode must contain 6 digits.";
    }

    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const doPay = async (e) => {
    e.preventDefault();

    if (!checkForm()) {
      return;
    }

    setIsPay(true);
    setErr("");

    try {
      const res1 = await createPaymentOrder({
        shippingAddress: {
          ...form1,
          phone: form1.phone.trim(),
          pincode: form1.pincode.trim(),
        },
      });

      await loadScript();

      const { razorpay, shopkartOrderId } = res1.data;
      if (!razorpay?.key || !razorpay.orderId || !shopkartOrderId) {
        throw new Error("Payment order response is incomplete. Please try again.");
      }

      console.log("payment order created", shopkartOrderId);

      const options = {
        key: razorpay.key,
        amount: razorpay.amount,
        currency: razorpay.currency,
        order_id: razorpay.orderId,
        name: "ShopKart",
        description: "Order Payment",
        handler: async (paymentResponse) => {
          try {
            await verifyPayment({
              orderId: shopkartOrderId,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });

            clearCart();
            navigate(`/order-success/${shopkartOrderId}`);
          } catch (error) {
            setErr(
              error.response?.data?.message ||
                "Payment verification failed. Please try again.",
            );
          }
        },
        prefill: {
          name: form1.fullName,
          contact: form1.phone,
        },
        theme: {
          color: "#232f3e",
        },
        modal: {
          ondismiss: () => {
            setErr("Payment cancelled. Your cart remains unchanged.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          error.message ||
          "Unable to create payment order.",
      );
    } finally {
      setIsPay(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="page">
          <p className="loading">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="page">
          <div className="empty-state">
            <p className="empty">Your cart is empty.</p>
            <Link className="button-link" to="/products">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="page checkout-page-shell">
        <div className="checkout-page">
          <form className="checkout-form" onSubmit={doPay}>
            <h1>Checkout</h1>

            <div className="checkout-section">
              <h2>Shipping Details</h2>

              <div className="form-grid">
                <div>
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={form1.fullName}
                    onChange={doChange}
                  />
                  {fieldErr.fullName && <p className="field-error">{fieldErr.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    value={form1.phone}
                    onChange={doChange}
                  />
                  {fieldErr.phone && <p className="field-error">{fieldErr.phone}</p>}
                </div>

                <div className="full-width">
                  <label htmlFor="addressLine1">Address</label>
                  <input
                    id="addressLine1"
                    name="addressLine1"
                    value={form1.addressLine1}
                    onChange={doChange}
                  />
                  {fieldErr.addressLine1 && (
                    <p className="field-error">{fieldErr.addressLine1}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    value={form1.city}
                    onChange={doChange}
                  />
                  {fieldErr.city && <p className="field-error">{fieldErr.city}</p>}
                </div>

                <div>
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    value={form1.state}
                    onChange={doChange}
                  />
                  {fieldErr.state && <p className="field-error">{fieldErr.state}</p>}
                </div>

                <div>
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    name="pincode"
                    value={form1.pincode}
                    onChange={doChange}
                  />
                  {fieldErr.pincode && <p className="field-error">{fieldErr.pincode}</p>}
                </div>
              </div>
            </div>

            <div className="checkout-section summary-box">
              <h2>Order Summary</h2>

              {cartItems.map((item) => {
                const product = item.product;
                if (!product) {
                  return null;
                }

                return (
                  <div key={product._id} className="summary-row">
                    <span>
                      {product.name} × {item.quantity}
                    </span>
                    <span>
                      ₹{(Number(product.price) * Number(item.quantity)).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}

              <div className="summary-total">
                <span>Total</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>

              <div className="payment-note">
                <strong>Payment via Razorpay</strong>
                <p>Secure Test Mode checkout opens after you continue.</p>
              </div>

              {err && <p className="error">{err}</p>}

              <button type="submit" disabled={isPay}>
                {isPay ? "Preparing payment..." : `Continue to Razorpay (${cartCount})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
