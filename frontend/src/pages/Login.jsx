import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [form1, setForm1] = useState({
    email: "",
    password: "",
  });
  const [err, setErr] = useState("");

  const doChange = (e) => {
    setForm1({ ...form1, [e.target.name]: e.target.value });
  };

  const doLogin = async (e) => {
    e.preventDefault();
    setErr("");

    // both fields have to be filled
    if (!form1.email || !form1.password) {
      setErr("All fields are required");
      return;
    }

    try {
      await api.post("/customers/login", form1);
      console.log("login done, going to home");
      navigate("/home");
    } catch (er) {
      if (!er.response) {
        setErr("Cannot connect to server. Start the backend first.");
      } else if (er.response.status === 401) {
        setErr("Invalid Credentials");
      } else {
        setErr(er.response.data?.message || "Login failed");
      }
    }
  };

  return (
    <div className="page">
      <form className="card" onSubmit={doLogin}>
        <h1>Login</h1>

        {err && <p className="error">{err}</p>}

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

        <button type="submit">Login</button>

        <p className="link-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
