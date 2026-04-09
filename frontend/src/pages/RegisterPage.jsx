import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function RegisterPage() {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function onSubmit(event) {
		event.preventDefault();

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setError("");
		setSubmitting(true);

		try {
			await register(username, password);
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
				<h1>Create account</h1>
				<label>
					Username
					<input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required />
				</label>
				<label>
					Password
					<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
				</label>
				<label>
					Confirm password
					<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required />
				</label>
				{error && <p className="error">{error}</p>}
				<button type="submit" disabled={submitting}>
					{submitting ? "Creating account..." : "Register"}
				</button>
				<p>
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</form>
		</main>
	);
}
