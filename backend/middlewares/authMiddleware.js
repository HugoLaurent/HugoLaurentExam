// backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...v] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(v.join("=") || "");
    return acc;
  }, {});
};

exports.authenticateToken = (req, res, next) => {
  const bearer = req.headers["authorization"]?.split(" ")[1];
  const cookies = parseCookies(req.headers.cookie || "");
  const token = bearer || cookies.token;

  if (!token) return res.sendStatus(401);

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("Erreur de vérification du token");
        return res.status(403).json({ error: true, message: "Token invalide" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(403).json({ error: true, message: "Token invalide" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Accés interdit" });
  next();
};
