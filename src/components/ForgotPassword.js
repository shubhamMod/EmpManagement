import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      // ✅ Only send email in query params (matches your Spring Boot controller)
      const resp = await fetch(
        `http://localhost:1000/service/sending?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (resp.ok) {
        const data = await resp.text();
        setMessage(data || "OTP sent to your email. Please check your inbox.");

        // ✅ Redirect to VerifyOtp page after 1.5s
        setTimeout(() => {
          navigate("/verify-otp", { state: { email } });
        }, 1500);
      } else {
        let text = await resp.text();
        setError(text || "Something went wrong.");
      }
    } catch (err) {
      console.error("Forgot Password error:", err);
      setError("Network error — cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h3 className="text-center mb-3">Forgot Password</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Enter your Email
            </label>
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

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <div className="text-center mt-3">
          <small>
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </small>
        </div>
      </div>
    </div>
  );
}
