import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest, me, register as registerRequest } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(localStorage.getItem("token") || "");
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadUser() {
			if (!token) {
				setUser(null);
				setLoading(false);
				return;
			}

			try {
				const data = await me(token);
				setUser(data.user);
			} catch {
				localStorage.removeItem("token");
				setToken("");
				setUser(null);
			} finally {
				setLoading(false);
			}
		}

		loadUser();
	}, [token]);

	async function register(username, password) {
		const data = await registerRequest(username, password);
		localStorage.setItem("token", data.token);
		setToken(data.token);
		setUser(data.user);
	}

	async function login(username, password) {
		const data = await loginRequest(username, password);
		localStorage.setItem("token", data.token);
		setToken(data.token);
		setUser(data.user);
	}

	function logout() {
		localStorage.removeItem("token");
		setToken("");
		setUser(null);
	}

	const value = useMemo(() => ({ token, user, loading, register, login, logout, isAuthenticated: Boolean(token) }), [token, user, loading]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
