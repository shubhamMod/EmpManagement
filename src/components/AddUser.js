import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddUser({ user }) {
  const navigate = useNavigate();
  // const adminId = localStorage.getItem("id"); // Only store admin ID
  const adminId = user?.adminId;

  const [employee, setEmployee] = useState({
    firstname: "", lastname: "", department: "", designation: "", phone: "", address: ""
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" && value !== "" && !/^\d*$/.test(value)) return;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminId) {
      alert("Admin not logged in!");
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`http://localhost:1000/user/employee/add/${adminId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...employee, phone: parseInt(employee.phone,10) }),
      });

      if (response.status === 401 || response.status === 403) {
        alert("Session expired! Please log in again.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add employee");
      }

      setMessage("✅ Employee added successfully!");
      setEmployee({ firstname:"", lastname:"", department:"", designation:"", phone:"", address:"" });
      setTimeout(() => navigate("/home"), 2000);

    } catch (error) {
      console.error(error);
      setMessage(`⚠️ ${error.message}`);
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0 rounded-3">
        <div className="card-header bg-primary text-white"><h4>Add New Employee</h4></div>
        <div className="card-body">
          {message && <div className="alert alert-info">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row">
              {["firstname","lastname","department","designation","phone"].map((field)=>(
                <div className="col-md-6 mb-3" key={field}>
                  <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input type="text" name={field} className="form-control" value={employee[field]} onChange={handleChange} required/>
                </div>
              ))}
              <div className="col-md-12 mb-3">
                <label className="form-label">Address</label>
                <textarea name="address" rows={3} className="form-control" value={employee.address} onChange={handleChange} required/>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <button type="button" className="btn btn-secondary" onClick={()=>navigate("/home")}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save Employee"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
