const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

function normalizeUsername(username) {
	return typeof username === "string" ? username.trim().toLowerCase() : "";
}

function validateUsername(username) {
	return /^[a-z0-9_]{3,30}$/.test(username);
}

router.post("/register", async (req, res) => {
	const { username, password } = req.body;
	const normalizedUsername = normalizeUsername(username);

	if (!validateUsername(normalizedUsername) || typeof password !== "string" || password.length < 8) {
		return res.status(400).json({ error: "Username must be 3-30 chars (a-z, 0-9, _) and password at least 8 characters" });
	}

	try {
		const passwordHash = await bcrypt.hash(password, 10);
		const result = await pool.query("INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username", [normalizedUsername, passwordHash]);

		const user = result.rows[0];
		const token = jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET || "dev-secret", {
			expiresIn: "7d"
		});

		return res.status(201).json({ token, user });
	} catch (error) {
		if (error.code === "23505") {
			return res.status(409).json({ error: "User already exists" });
		}
		return res.status(500).json({ error: "Failed to register" });
	}
});

router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const normalizedUsername = normalizeUsername(username);

	if (!validateUsername(normalizedUsername) || typeof password !== "string" || password.length < 8) {
		return res.status(400).json({ error: "Invalid credentials" });
	}

	try {
		const result = await pool.query("SELECT id, username, password_hash FROM users WHERE username = $1", [normalizedUsername]);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const user = result.rows[0];
		const validPassword = await bcrypt.compare(password, user.password_hash);
		if (!validPassword) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET || "dev-secret", {
			expiresIn: "7d"
		});

		return res.status(200).json({ token, user: { id: user.id, username: user.username } });
	} catch (error) {
		return res.status(500).json({ error: "Failed to login" });
	}
});

router.get("/me", authenticate, async (req, res) => {
	try {
		const result = await pool.query("SELECT id, username FROM users WHERE id = $1", [req.user.sub]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}
		return res.status(200).json({ user: result.rows[0] });
	} catch (error) {
		return res.status(500).json({ error: "Failed to fetch user" });
	}
});

module.exports = router;
