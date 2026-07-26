import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { setError("Invalid email or password."); setLoading(false); return; }
      const data = await res.json();
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      onLogin(data.token, role);
    } catch {
      setError("Could not connect to server.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0F172A"
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: "48px 40px",
        width: 400, boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 40, height: 40, background: "#3B82F6",
            borderRadius: 8, marginBottom: 16
          }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>
            Employee Records
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600,
              color: "#374151", marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required placeholder="admin@company.com"
              style={{
                width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0",
                borderRadius: 8, fontSize: 14, outline: "none",
                background: "#F8FAFC", color: "#1E293B"
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600,
              color: "#374151", marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required placeholder="••••••••"
              style={{
                width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0",
                borderRadius: 8, fontSize: 14, outline: "none",
                background: "#F8FAFC", color: "#1E293B"
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              color: "#DC2626", fontSize: 13
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "11px 0", background: "#3B82F6",
            color: "#fff", border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
