import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Login.css";

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const resp = await fetch("http://localhost:1000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // ✅ send cookies
      });

      if (resp.ok) {
        const data = await resp.json();
        localStorage.removeItem("id");
        setUser({ 
          adminId: data.id, 
          email, 
          name: data.firstname, 
          token: data.token 
        });
        navigate("/home");
      } else if (resp.status === 401) {
        setError("Invalid credentials — please try again.");
      } else {
        let text = await resp.text();
        setError(text || `Login failed: ${resp.status}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error — cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg d-flex justify-content-center align-items-center vh-100">
      <div className="card login-card shadow p-4">
        <h3 className="text-center mb-4">Modus Login Admin</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center mt-3">
            <small>
              Don't have an account? <a href="/register">Register</a>
            </small>
          </div>

          <div className="text-center mt-2">
            <small>
              <button 
                type="button" 
                className="btn btn-link p-0" 
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}
