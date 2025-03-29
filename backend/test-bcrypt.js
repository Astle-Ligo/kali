const jwt = require("jsonwebtoken");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTU5NGIzYmMxNDU2MGQ1NTc4MDEyNSIsImlhdCI6MTc0MzEwMzM1NSwiZXhwIjoxNzQzNzA4MTU1fQ.a3G_ARZYVa0wWT-GZzNVQV3J6h9Q-lTAEVorRU0KdAA";
const secret = "zrZ1YH-Jb2nAHr1D0GYyc"; // Ensure this matches exactly

try {
    const decoded = jwt.verify(token, secret);
    console.log("✅ Token is valid:", decoded);
} catch (error) {
    console.error("🔥 Token verification failed:", error.message);
}
