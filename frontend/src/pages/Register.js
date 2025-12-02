// src/pages/Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import { register as registerRequest } from "../services/authApi";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError("Tous les champs sont requis.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("L'adresse email n'est pas valide.");
      return;
    }

    if (formData.password.length < 12) {
      setError("Le mot de passe doit contenir au moins 12 caracteres.");
      return;
    }

    if (formData.password.includes(" ")) {
      setError("Le mot de passe ne doit pas contenir d'espaces.");
      return;
    }

    if (
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      setError(
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre."
      );
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError("Le mot de passe doit contenir au moins un caractere special.");
      return;
    }
    setError("");

    try {
      await registerRequest(formData);
      showToast("Inscription reussie ! Vous pouvez maintenant vous connecter.", "success");
      navigate("/login");
    } catch (err) {
      if (err.response) {
        const { message } = err.response.data;
        setError(
          message || "Une erreur est survenue lors de la creation du compte."
        );
      } else {
        console.error("Erreur reseau ou serveur", err);
        setError("Une erreur est survenue. Veuillez reessayer.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Inscription</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          value={formData.username}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full mb-4"
        />
        <input
          type="email"
          name="email"
          placeholder="Adresse email"
          value={formData.email}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full mb-4"
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
};

export default Register;
