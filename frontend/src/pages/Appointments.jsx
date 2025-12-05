// frontend/src/pages/Appointments.jsx
import React, {useEffect, useState} from 'react'
import api from '../utils/api'

export default function Appointments(){
  const [appts, setAppts] = useState([])

  useEffect(()=>{ fetch() },[])

  async function fetch(){
    try{
      const res = await api.get('/api/appointments') // may not exist in backend
      setAppts(res.data || [])
    }catch(err){
      console.error(err)
    }
  }

  return (
    <div>
      <h2 className='text-xl mb-2'>Mes Rendez-vous</h2>
      <div className='grid gap-2'>
        {appts.length===0 && <div className='text-gray-500'>Aucun RDV ou endpoint manquant</div>}
        {appts.map(a=>(
          <div key={a.id} className='bg-white p-3 rounded shadow'>
            <div>{a.start_time || a.startTime}</div>
            <div className='text-sm text-gray-600'>{a.status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
