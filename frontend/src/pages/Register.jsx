import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form1, setForm1] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [err, setErr] = useState("");

  const doChange = (e) => {
    setForm1({ ...form1, [e.target.name]: e.target.value });
  };

  const doSignup = async (e) => {
    e.preventDefault();
    setErr("");

    // need all the fields before we call the api
    if (!form1.fullName || !form1.email || !form1.password || !form1.phone) {
      setErr("All fields are required");
      return;
    }

    // small check on password length
    if (form1.password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    try {
      await api.post("/customers/register", form1);
      console.log("signup ok, sending to login page");
      navigate("/login");
    } catch (er) {
      if (!er.response) {
        setErr("Cannot connect to server. Start the backend first.");
      } else {
        setErr(er.response.data?.message || "Registration failed");
      }
    }
  };

  return (
    <div className="page">
      <form className="card" onSubmit={doSignup}>
        <h1>Create Account</h1>

        {err && <p className="error">{err}</p>}

        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          value={form1.fullName}
          onChange={doChange}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={form1.email}
          onChange={doChange}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={form1.password}
          onChange={doChange}
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          value={form1.phone}
          onChange={doChange}
        />

        <button type="submit">Create Account</button>

        <p className="link-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
