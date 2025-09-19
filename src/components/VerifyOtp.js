import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ""; // passed from ForgotPassword

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const resp = await fetch("http://localhost:1000/service/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });

      if (resp.ok) {
        const data = await resp.text();
        setMessage(data);

        // ✅ Navigate to Reset Password page
        setTimeout(() => {
          navigate("/reset-password", { state: { email } });
        }, 1500);
      } else {
        let text = await resp.text();
        setError(text || "Invalid OTP.");
      }
    } catch (err) {
      console.error("OTP Verify error:", err);
      setError("Network error — cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-3">Verify OTP</h3>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <label htmlFor="otp" className="form-label">Enter OTP</label>
            <input
              id="otp"
              type="text"
              className="form-control"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
