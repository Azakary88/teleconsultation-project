import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { getUserId, getRole } from "../utils/auth";

export default function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = getUserId();
  const role = (getRole() || "").toUpperCase();

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setError("");
    setLoading(true);

    try {
      const res = await api.get(`/api/appointments/${id}`);
      setAppt(res.data);
    } catch (err) {
      console.error("Erreur chargement RDV:", err);
      setError("Impossible de charger les détails du rendez-vous.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus) {
    try {
      await api.patch(`/api/appointments/${id}`, { status: newStatus });
      setAppt((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
      alert("Erreur lors du changement de statut.");
    }
  }

  async function cancelAppointment() {
    if (!confirm("Voulez-vous annuler ce rendez-vous ?")) return;

    try {
      await api.patch(`/api/appointments/${id}`, { status: "cancelled" });
      alert("Rendez-vous annulé.");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Impossible d'annuler ce rendez-vous.");
    }
  }

  if (loading) return <div className="p-4">Chargement…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!appt) return <div className="p-4">Rendez-vous introuvable.</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Détails du rendez-vous</h2>

      <div className="bg-white p-4 rounded shadow space-y-2">
        <p><strong>ID :</strong> {appt.id}</p>
        <p><strong>Titre :</strong> {appt.title}</p>
        <p><strong>Date :</strong> {appt.start_time}</p>
        <p><strong>Statut :</strong> {appt.status}</p>

        <p><strong>Patient :</strong> {appt.patientEmail || appt.patientId}</p>
        <p><strong>Médecin :</strong> {appt.doctorEmail || appt.doctorId}</p>

        {appt.notes && (
          <p><strong>Notes :</strong> {appt.notes}</p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {/* Actions pour patient */}
        {role === "PATIENT" && appt.patientId === userId && appt.status !== "cancelled" && (
          <button
            onClick={cancelAppointment}
            className="px-3 py-2 bg-red-600 text-white rounded"
          >
            Annuler le rendez-vous
          </button>
        )}

        {/* Actions pour médecin */}
        {role === "DOCTOR" && appt.doctorId === userId && (
          <>
            {appt.status !== "confirmed" && (
              <button
                onClick={() => updateStatus("confirmed")}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Accepter
              </button>
            )}

            {appt.status !== "done" && (
              <button
                onClick={() => updateStatus("done")}
                className="px-3 py-2 bg-yellow-600 text-white rounded"
              >
                Marquer comme terminé
              </button>
            )}

            {appt.status !== "cancelled" && (
              <button
                onClick={() => updateStatus("cancelled")}
                className="px-3 py-2 bg-red-500 text-white rounded"
              >
                Annuler
              </button>
            )}
          </>
        )}

        <Link to="/appointments" className="px-3 py-2 border rounded text-center">
          Retour
        </Link>
      </div>
    </div>
  );
}
