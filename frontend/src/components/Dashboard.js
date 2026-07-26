import { useState, useEffect } from "react";

function Dashboard({ token, role, onLogout }) {
  const [activeTab, setActiveTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "", department: "", position: "" });
  const [userForm, setUserForm] = useState({ fullName: "", email: "", password: "", role: "Viewer" });
  const [showForm, setShowForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchEmployees = async () => {
    const res = await fetch("http://localhost:5000/api/employee", { headers });
    const data = await res.json();
    setEmployees(data);
  };

  const fetchAuditLogs = async () => {
    const res = await fetch("http://localhost:5000/api/auditlog", { headers });
    const data = await res.json();
    setAuditLogs(data);
  };

  useEffect(() => {
    fetchEmployees();
    if (role === "Admin") fetchAuditLogs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const res = await fetch("http://localhost:5000/api/employee", {
      method: "POST", headers, body: JSON.stringify(form),
    });
    if (!res.ok) { setError("Failed to create employee."); return; }
    setSuccess("Employee added successfully.");
    setForm({ fullName: "", email: "", department: "", position: "" });
    setShowForm(false);
    fetchEmployees();
    fetchAuditLogs();
  };

  const handleDisable = async (id) => {
    if (!window.confirm("Disable this employee?")) return;
    await fetch(`http://localhost:5000/api/employee/${id}`, { method: "DELETE", headers });
    fetchEmployees();
    fetchAuditLogs();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError(""); setUserSuccess("");
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST", headers, body: JSON.stringify(userForm),
    });
    if (!res.ok) {
      const msg = await res.text();
      setUserError(msg || "Failed to create user.");
      return;
    }
    setUserSuccess("User created successfully.");
    setUserForm({ fullName: "", email: "", password: "", role: "Viewer" });
    setShowUserForm(false);
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0",
    borderRadius: 7, fontSize: 13, background: "#F8FAFC",
    color: "#1E293B", outline: "none"
  };

  const thStyle = {
    padding: "12px 20px", textAlign: "left", fontSize: 12,
    fontWeight: 700, color: "#64748B", textTransform: "uppercase",
    letterSpacing: "0.05em", background: "#F8FAFC",
    borderBottom: "1px solid #E2E8F0"
  };

  const tdStyle = {
    padding: "14px 20px", fontSize: 14, color: "#475569",
    borderBottom: "1px solid #F1F5F9"
  };

  const tabs = role === "Admin"
    ? ["employees", "auditlog", "users"]
    : ["employees"];

  const tabLabels = {
    employees: "Employees",
    auditlog: "Audit Log",
    users: "Manage Users"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      {/* Navbar */}
      <div style={{
        background: "#0F172A", padding: "0 40px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 28, background: "#3B82F6", borderRadius: 6 }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
            Employee Records
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{
            background: "#1E3A5F", color: "#93C5FD",
            fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20
          }}>{role}</span>
          <button onClick={onLogout} style={{
            background: "transparent", border: "1px solid #334155",
            color: "#94A3B8", padding: "6px 16px", borderRadius: 7,
            fontSize: 13, cursor: "pointer"
          }}>Sign out</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28,
          borderBottom: "1px solid #E2E8F0" }}>
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "10px 20px", border: "none", background: "transparent",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              color: activeTab === tab ? "#3B82F6" : "#64748B",
              borderBottom: activeTab === tab ? "2px solid #3B82F6" : "2px solid transparent",
              marginBottom: -1
            }}>
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Employees</h2>
                <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>
                  {employees.length} active record{employees.length !== 1 ? "s" : ""}
                </p>
              </div>
              {role === "Admin" && (
                <button onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }} style={{
                  padding: "9px 20px", background: "#3B82F6", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}>
                  {showForm ? "Cancel" : "+ Add Employee"}
                </button>
              )}
            </div>

            {showForm && role === "Admin" && (
              <div style={{ background: "#fff", border: "1px solid #E2E8F0",
                borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#0F172A" }}>
                  New Employee
                </h3>
                <form onSubmit={handleCreate}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Full Name", key: "fullName", placeholder: "Jane Smith" },
                      { label: "Email", key: "email", placeholder: "jane@company.com" },
                      { label: "Department", key: "department", placeholder: "Engineering" },
                      { label: "Position", key: "position", placeholder: "Software Engineer" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600,
                          color: "#374151", marginBottom: 5 }}>{label}</label>
                        <input style={inputStyle} placeholder={placeholder}
                          value={form[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          required />
                      </div>
                    ))}
                  </div>
                  {error && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</div>}
                  {success && <div style={{ color: "#16A34A", fontSize: 13, marginBottom: 12 }}>{success}</div>}
                  <button type="submit" style={{
                    padding: "9px 24px", background: "#3B82F6", color: "#fff",
                    border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer"
                  }}>Add Employee</button>
                </form>
              </div>
            )}

            <div style={{ background: "#fff", border: "1px solid #E2E8F0",
              borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Position</th>
                    <th style={thStyle}>Status</th>
                    {role === "Admin" && <th style={thStyle}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: "#0F172A" }}>{emp.fullName}</td>
                      <td style={tdStyle}>{emp.email}</td>
                      <td style={tdStyle}>{emp.department}</td>
                      <td style={tdStyle}>{emp.position}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: "#DCFCE7", color: "#16A34A",
                          fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }} />
                          Active
                        </span>
                      </td>
                      {role === "Admin" && (
                        <td style={tdStyle}>
                          <button onClick={() => handleDisable(emp.id)} style={{
                            padding: "6px 14px", background: "#FEF2F2",
                            color: "#DC2626", border: "1px solid #FECACA",
                            borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer"
                          }}>Disable</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {employees.length === 0 && (
                <div style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
                  No active employees found.
                </div>
              )}
            </div>
          </>
        )}

        {/* Audit Log Tab */}
        {activeTab === "auditlog" && role === "Admin" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Audit Log</h2>
              <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>
                All system actions tracked automatically
              </p>
            </div>
            <div style={{ background: "#fff", border: "1px solid #E2E8F0",
              borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>Action</th>
                    <th style={thStyle}>Entity</th>
                    <th style={thStyle}>Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={tdStyle}>{new Date(log.performedAt).toLocaleString()}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 20,
                          fontSize: 12, fontWeight: 600,
                          background: log.action === "Create" ? "#DCFCE7" :
                            log.action === "Update" ? "#DBEAFE" : "#FEF2F2",
                          color: log.action === "Create" ? "#16A34A" :
                            log.action === "Update" ? "#2563EB" : "#DC2626"
                        }}>{log.action}</span>
                      </td>
                      <td style={tdStyle}>{log.entityName}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: "#0F172A" }}>{log.performedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditLogs.length === 0 && (
                <div style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
                  No audit entries yet.
                </div>
              )}
            </div>
          </>
        )}

        {/* Manage Users Tab */}
        {activeTab === "users" && role === "Admin" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Manage Users</h2>
                <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>
                  Create accounts for staff members
                </p>
              </div>
              <button onClick={() => { setShowUserForm(!showUserForm); setUserError(""); setUserSuccess(""); }} style={{
                padding: "9px 20px", background: "#3B82F6", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>
                {showUserForm ? "Cancel" : "+ Add User"}
              </button>
            </div>

            {showUserForm && (
              <div style={{ background: "#fff", border: "1px solid #E2E8F0",
                borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#0F172A" }}>
                  New User
                </h3>
                <form onSubmit={handleCreateUser}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600,
                        color: "#374151", marginBottom: 5 }}>Full Name</label>
                      <input style={inputStyle} placeholder="Jane Smith"
                        value={userForm.fullName}
                        onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                        required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600,
                        color: "#374151", marginBottom: 5 }}>Email</label>
                      <input style={inputStyle} placeholder="jane@company.com" type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600,
                        color: "#374151", marginBottom: 5 }}>Password</label>
                      <input style={inputStyle} placeholder="••••••••" type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600,
                        color: "#374151", marginBottom: 5 }}>Role</label>
                      <select style={inputStyle}
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                        <option value="Viewer">Viewer</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  {userError && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{userError}</div>}
                  {userSuccess && <div style={{ color: "#16A34A", fontSize: 13, marginBottom: 12 }}>{userSuccess}</div>}
                  <button type="submit" style={{
                    padding: "9px 24px", background: "#3B82F6", color: "#fff",
                    border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer"
                  }}>Create User</button>
                </form>
              </div>
            )}

            <div style={{ background: "#fff", border: "1px solid #E2E8F0",
              borderRadius: 12, padding: 32, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
              User list coming soon — create accounts using the form above.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
