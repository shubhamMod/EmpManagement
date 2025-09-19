import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("http://localhost:1000/service/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (resp.ok) {
        setMessage("✅ Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const text = await resp.text();
        setError(text || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset Password error:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-3">Reset Password</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
