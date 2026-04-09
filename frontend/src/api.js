const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {})
		},
		...options
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || "Request failed");
	}

	return data;
}

export function register(username, password) {
	return request("/api/auth/register", {
		method: "POST",
		body: JSON.stringify({ username, password })
	});
}

export function login(username, password) {
	return request("/api/auth/login", {
		method: "POST",
		body: JSON.stringify({ username, password })
	});
}

export function me(token) {
	return request("/api/auth/me", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
}
