const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({ error: "missing_authorization_header" });
  }

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "invalid_authorization_format" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "dev_access_secret_123");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "invalid_or_expired_token", details: err.message });
  }
};
