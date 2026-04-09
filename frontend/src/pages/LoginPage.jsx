import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function onSubmit(event) {
		event.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			await login(username, password);
			navigate("/");
		} catch (submitError) {
			setError(submitError.message);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="layout">
			<form className="auth-card" onSubmit={onSubmit}>
				<h1>Login</h1>
				<label>
					Username
					<input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required />
				</label>
				<label>
					Password
					<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
				</label>
				{error && <p className="error">{error}</p>}
				<button type="submit" disabled={submitting}>
					{submitting ? "Logging in..." : "Login"}
				</button>
				<p>
					No account yet? <Link to="/register">Register</Link>
				</p>
			</form>
		</main>
	);
}
