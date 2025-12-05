import React, {useEffect, useState} from 'react'
import api from '../utils/api'
import { Link } from 'react-router-dom'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])

  useEffect(() => { loadDoctors() }, [])

  async function loadDoctors() {
    try {
      const res = await api.get('/api/doctors')
      setDoctors(res.data || [])
    } catch (err) {
      console.error("Erreur chargement médecins :", err)
      setDoctors([])
    }
  }

  return (
    <div>
      <h2 className='text-xl mb-2'>Médecins disponibles</h2>

      <div className='grid gap-2'>

        {/* Aucune donnée */}
        {doctors.length === 0 && (
          <div className='text-gray-500'>Aucun médecin disponible</div>
        )}

        {/* Liste */}
        {doctors.map(d => (
          <div key={d.id} className='bg-white p-3 rounded shadow flex justify-between items-center'>
            <div>
              {/* Nom / Email */}
              <div className='font-semibold'>
                {d.email || "Médecin"}
              </div>

              {/* Spécialité */}
              <div className='text-sm text-gray-600'>
                {d.speciality || "Aucune spécialité renseignée"}
              </div>

              {/* Numéro licence */}
              {d.license_number && (
                <div className='text-xs text-gray-500'>
                  Licence : {d.license_number}
                </div>
              )}
            </div>

            <Link
              to="/create-appointment"
              state={{ doctor: d }}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Prendre RDV
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
