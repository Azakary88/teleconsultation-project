import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [role, setRole] = useState("PATIENT"); // PATIENT or DOCTOR
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // Docteur-specific
  const [speciality, setSpeciality] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function validateEmail(e) {
    // simple email check
    return /\S+@\S+\.\S+/.test(e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Basic validations
    if (!email || !validateEmail(email)) {
      setError("Veuillez fournir une adresse email valide.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== password2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (role === "DOCTOR") {
      if (!speciality) {
        setError("Veuillez indiquer la spécialité du médecin.");
        return;
      }
      if (!licenseNumber) {
        setError("Veuillez indiquer le numéro de licence.");
        return;
      }
    }

    setLoading(true);

    try {
      if (role === "DOCTOR") {
        // endpoint dedicated register-doctor
        const payload = {
          email,
          password,
          speciality,
          license_number: licenseNumber,
          bio,
        };
        await api.post("/api/auth/register-doctor", payload);
      } else {
        // patient
        const payload = { email, password };
        // si tu utilises /api/auth/register-patient
        await api.post("/api/auth/register-patient", payload);
      }

      // succès : rediriger vers login
      alert("Inscription réussie. Vous pouvez maintenant vous connecter.");
      navigate("/login");
    } catch (err) {
      console.error("Register error", err);
      // axios style
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.details ||
        err?.message ||
        "Erreur serveur";
      setError(String(serverMsg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Créer un compte</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Rôle</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="PATIENT"
                checked={role === "PATIENT"}
                onChange={() => setRole("PATIENT")}
              />
              Patient
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="DOCTOR"
                checked={role === "DOCTOR"}
                onChange={() => setRole("DOCTOR")}
              />
              Médecin
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmer mot de passe
            </label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full border p-2 rounded"
              required
              minLength={6}
            />
          </div>
        </div>

        {/* Doctor fields */}
        {role === "DOCTOR" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Spécialité</label>
              <input
                type="text"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Ex: Cardiologie"
                required={role === "DOCTOR"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Numéro de licence
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Ex: DOC-12345"
                required={role === "DOCTOR"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio (optionnelle)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border p-2 rounded"
                rows={3}
              />
            </div>
          </>
        )}

        <div className="flex gap-2 items-center">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "En cours…" : "S'inscrire"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="px-4 py-2 border rounded"
          >
            Se connecter
          </button>
        </div>
      </form>
    </div>
  );
}
