import { AuthProvider, useAuth } from "./AuthContext";
import LoginRegister from "./LoginRegister";
import SweetList from "./SweetList";
import AdminPanel from "./AdminPanel";

function AppContent() {
  const { user, logout } = useAuth();

  if (!user) {
    return <LoginRegister />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header with user info and logout */}
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "15px",
            padding: "20px 30px",
            marginBottom: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#667eea",
                fontSize: "2.5rem",
              }}
            >
              🍬 Mithai Junction - Your Sweet Paradise 🍭
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "#666" }}>
              Namaste, <strong>{user.username}</strong>!
              {user.is_admin && <span style={{ color: "#667eea", marginLeft: "10px" }}>👑 Administrator</span>}
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#f56565",
              color: "white",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        {/* Admin Panel or Sweet List */}
        {user.is_admin ? <AdminPanel /> : <SweetList />}

        {/* Show sweet list for admins too */}
        {user.is_admin && (
          <div style={{ marginTop: "40px" }}>
            <h2 style={{ color: "white", textAlign: "center", marginBottom: "20px" }}>
              🛒 Customer View
            </h2>
            <SweetList />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
