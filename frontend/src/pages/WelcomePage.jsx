import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function WelcomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main className="layout">
      <section className="auth-card">
        <h1>Welcome</h1>
        <p>You are now authenticated.</p>
        <p>
          Signed in as <strong>{user?.username || "unknown"}</strong>
        </p>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </section>
    </main>
  );
}
