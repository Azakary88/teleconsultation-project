import React, {useEffect, useState} from 'react'
import api from '../utils/api'
import { Link } from 'react-router-dom'

export default function Doctors(){
  const [doctors, setDoctors] = useState([])

  useEffect(()=>{ fetch() },[])

  async function fetch(){
    try{
      const res = await api.get('/api/doctors')
      setDoctors(res.data || [])
    }catch(err){
      console.error(err)
    }
  }

  return (
    <div>
      <h2 className='text-xl mb-2'>Médecins</h2>
      <div className='grid gap-2'>
        {doctors.map(d=>(
          <div key={d.id} className='bg-white p-3 rounded shadow flex justify-between items-center'>
            <div>
              <div className='font-semibold'>{d.firstname || d.name || d.email}</div>
              <div className='text-sm text-gray-600'>{d.specialty || ''}</div>
            </div>
            <div>
              <Link to='/create-appointment' state={{doctor:d}} className='px-3 py-1 bg-blue-600 text-white rounded'>Prendre RDV</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
