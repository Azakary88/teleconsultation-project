import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/api/profile");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le profil.");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!profile) return <div className="p-4">Chargement…</div>;

  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Mon profil</h2>

      <div className="mb-2">
        <strong>Email :</strong> {profile.email}
      </div>
      <div className="mb-2">
        <strong>Rôle :</strong> {profile.role}
      </div>

      {profile.role === "DOCTOR" && profile.doctor && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h3 className="font-medium mb-2">Informations Médecin</h3>
          <div><strong>Spécialité :</strong> {profile.doctor.speciality || "Non renseignée"}</div>
          <div><strong>Numéro licence :</strong> {profile.doctor.license_number || "Non renseigné"}</div>
          <div><strong>Bio :</strong> {profile.doctor.bio || "Aucune information"}</div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-4 w-full bg-red-600 text-white py-2 rounded"
      >
        Déconnexion
      </button>
    </div>
  );
}
