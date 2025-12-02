const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();
const axios = require("axios");
const authLog = require("debug")("authRoutes:console");

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 60 * 60 * 1000, // 1h
  path: "/",
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user)
      return res.status(400).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, cookieOptions);
    res.json({ role: user.role, username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  if (typeof username === "string") req.body.username = username.trim();
  if (typeof email === "string") req.body.email = email.trim().toLowerCase();
  if (typeof password === "string") req.body.password = password.trim();

  if (password.length < 12) {
    return res.status(400).json({
      message: "Le mot de passe doit contenir au moins 12 caractères.",
    });
  }

  if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).json({
      message:
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.",
    });
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return res.status(400).json({
      message: "Le mot de passe doit contenir au moins un caractère spécial.",
    });
  }

  if (/\s/.test(password)) {
    return res.status(400).json({
      message: "Le mot de passe ne doit pas contenir d'espaces.",
    });
  }

  if (/\s/.test(username)) {
    return res.status(400).json({
      message: "Le nom d'utilisateur ne doit pas contenir d'espaces.",
    });
  }

  if (/\s/.test(email)) {
    return res.status(400).json({
      message: "L'email ne doit pas contenir d'espaces.",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      authLog(`user exist => ${JSON.stringify(existingUser)}`);
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const user = new User({ username, email, password });
    await user.save();

    authLog(`user after creation => ${JSON.stringify(user)}`);

    res.status(201).json({ message: "Utilisateur créé avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'inscription", error);
    res.status(500).json({ message: "Une erreur est survenue." });
  }
};

exports.me = async (req, res) => {
  return res.json({
    userId: req.user.userId,
    role: req.user.role,
    username: req.user.username,
  });
};

exports.logout = async (req, res) => {
  res.cookie("token", "", { ...cookieOptions, maxAge: 0 });
  res.json({ message: "Déconnecté" });
};
