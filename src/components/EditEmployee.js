import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditEmployee({ user }) {
  const { id } = useParams(); // employeeId
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    firstname: "",
    lastname: "",
    department: "",
    designation: "",
    phone: "",
    address: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const adminId = user?.adminId;
  console.log("AdminId:", adminId);

  useEffect(() => {
    if (!adminId) {
      alert("Login required!");
      navigate("/login");
      return;
    }

    fetch(`http://localhost:1000/user/fetching/${id}`, { credentials: "include" })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          alert("Session expired!");
          navigate("/login");
          throw new Error();
        }
        if (!res.ok) throw new Error("Failed to fetch employee");
        return res.json();
      })
      .then(data => setEmployee(data))
      .catch(() => setMessage("⚠️ Error fetching employee"))
      .finally(() => setLoading(false));
  }, [id, adminId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" && value !== "" && !/^\d*$/.test(value)) return;
    if ((name === "department" || name === "designation") && /[^a-zA-Z\s]/.test(value)) return;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:1000/user/update/${id}?adminId=${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(employee)
      });

      if (res.status === 401 || res.status === 403) {
        alert("Session expired!");
        navigate("/login");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update");
      }

      setMessage("✅ Employee updated successfully!");
      setTimeout(() => navigate("/home"), 1500);
    } catch (e) {
      console.error(e);
      setMessage(`⚠️ ${e.message}`);
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  if (loading)
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p>Loading employee data...</p>
      </div>
    );

  return (
    <div className="container mt-5">
      <h2>Edit Employee</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row">
          {["firstname", "lastname", "department", "designation", "phone"].map((f, i) => (
            <div className="col-md-6 mb-3" key={i}>
              <label className="form-label">{f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <input
                type="text"
                name={f}
                className="form-control"
                value={employee[f]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div className="col-md-12 mb-3">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              rows={3}
              className="form-control"
              value={employee.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (!submitting && window.confirm("Discard changes?")) navigate("/home");
            }}
          >
            Back
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Updating..." : "Update Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
