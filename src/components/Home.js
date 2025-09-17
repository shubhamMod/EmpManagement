import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function Home({ user }) {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);

  // Logout handler
  const handleLogout = useCallback(
    (expired = false) => {
      fetch("http://localhost:1000/user/logout", {
        method: "POST",
        credentials: "include",
      }).finally(() => {
        if (expired) {
          alert("Session expired! Please log in again.");
        } else {
          alert("You have been logged out.");
        }
        navigate("/login");
      });
    },
    [navigate]
  );

  // Fetch employees
  const fetchEmployees = useCallback(() => {
    setLoading(true);
    fetch(
      `http://localhost:1000/user/all?page=${page}&size=${size}&field=${sortField}&direction=${sortDirection}`,
      { credentials: "include" }
    )
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          handleLogout(true);
          throw new Error("Unauthorized - session expired");
        }
        if (!res.ok) throw new Error("Failed to fetch employees");
        return res.json();
      })
      .then((data) => {
        setEmployees(data.content || []);
        setTotalPages(data.totalPages || 0);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  }, [page, size, sortField, sortDirection, handleLogout]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const nextPage = () => page < totalPages - 1 && setPage(page + 1);
  const prevPage = () => page > 0 && setPage(page - 1);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // console.log({user?.email});
  
  const handleEdit = (id) => navigate(`/editEmployee/${id}`);

  // Disable employee
  const handleDisable = (id) => {
    if (!window.confirm("Are you sure you want to disable this employee?")) return;

    fetch(`http://localhost:1000/user/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          handleLogout(true);
          throw new Error("Unauthorized - session expired");
        }
        if (!res.ok) throw new Error("Failed to disable employee");
        return res.text();
      })
      .then((msg) => {
        alert(msg || "Employee disabled successfully!");
        fetchEmployees();
      })
      .catch((err) => console.error("Error disabling employee:", err));
  };

  // Enable employee
  const handleEnable = (id) => {
    if (!window.confirm("Are you sure you want to enable this employee?")) return;

    fetch(`http://localhost:1000/user/enable/${id}`, {
      method: "PUT",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          handleLogout(true);
          throw new Error("Unauthorized - session expired");
        }
        if (!res.ok) throw new Error("Failed to enable employee");
        return res.text();
      })
      .then((msg) => {
        alert(msg || "Employee enabled successfully!");
        fetchEmployees();
      })
      .catch((err) => console.error("Error enabling employee:", err));
  };

  return (
    <div className="container mt-5">
      <h2>Welcome {user?.name}</h2>
      <div className="d-flex justify-content-between mb-3">
     
        <button
          className="btn btn-primary"
          onClick={() => navigate("/addEmployee")}
        >
          Add Employee
        </button>
        <button className="btn btn-danger" onClick={() => handleLogout(false)}>
          Logout
        </button>
      </div>
      {/* <h1>Welcome {user?.email}</h1> */}

      <h1 style={{color:"green"}} >Modus Information Employee List</h1>

      {loading ? (
        <p>Loading employees...</p>
      ) : employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                {[
                  "id",
                  "firstname",
                  "lastname",
                  "department",
                  "designation",
                  "phone",
                  "address",
                  "status",
                  "actions",
                ].map((col) => (
                  <th
                    key={col}
                    onClick={() => toggleSort(col)}
                    style={{ cursor: "pointer" }}
                  >
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                    {sortField === col
                      ? sortDirection === "asc"
                        ? " 🔼"
                        : " 🔽"
                      : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.firstname}</td>
                  <td>{emp.lastname}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.address}</td>
                  <td>{emp.enabled ? "Active" : "Not Active"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(emp.id)}
                    >
                      Edit
                    </button>
                    {emp.enabled ? (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDisable(emp.id)}
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleEnable(emp.id)}
                      >
                        Enable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-primary"
              onClick={prevPage}
              disabled={page === 0}
            >
              Previous
            </button>
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={nextPage}
              disabled={page + 1 === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
