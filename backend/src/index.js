const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const ratelimit = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const { initDb } = require("./db");

dotenv.config();

const app = express();

const limiter = ratelimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: "too many requests from this ip, try again in 15 minutes"
});

app.use(limiter);
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

const publicDir = path.join(__dirname, "..", "public");
if (fs.existsSync(publicDir)) {
	app.use(express.static(publicDir));
	app.get("*", (req, res, next) => {
		if (req.path.startsWith("/api")) {
			return next();
		}
		return res.sendFile(path.join(publicDir, "index.html"));
	});
}

if (require.main === module) {
	const port = process.env.PORT || 8080;
	initDb()
		.then(() => {
			app.listen(port, () => {
				console.log(`Server listening on port ${port}`);
			});
		})
		.catch((error) => {
			console.error("Failed to initialize database", error);
			process.exit(1);
		});
}

module.exports = app;
