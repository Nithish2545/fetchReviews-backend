// middleware/auth.js
export function verifyBearerToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  // Authorization header must start with "Bearer "
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: "Invalid Authorization header format" });
  }

  // Validate token against environment token
  if (token !== process.env.API_BEARER_TOKEN) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  next(); // token valid → continue
}
