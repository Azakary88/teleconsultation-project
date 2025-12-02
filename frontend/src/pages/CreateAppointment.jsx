import React, {useState, useEffect} from 'react'
import api from '../utils/api'
import { useLocation, useNavigate } from 'react-router-dom'

export default function CreateAppointment(){
  const loc = useLocation()
  const doctor = loc.state?.doctor
  const [startTime, setStartTime] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      // fetch profile to get patient id
      const profile = await api.get('/api/profile')
      const patientId = profile.data.id
      await api.post('/api/appointments', { patientId, doctorId: doctor.id, startTime })
      alert('RDV créé')
      navigate('/appointments')
    }catch(err){
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className='max-w-md mx-auto bg-white p-4 rounded shadow'>
      <h2 className='text-lg mb-2'>Prendre RDV</h2>
      <p>Avec: {doctor?.firstname || doctor?.name || doctor?.email}</p>
      <form onSubmit={submit} className='flex flex-col gap-2'>
        <input placeholder='Start time ISO' value={startTime} onChange={e=>setStartTime(e.target.value)} className='border p-2 rounded' />
        <button className='bg-blue-600 text-white px-4 py-2 rounded'>Valider</button>
      </form>
    </div>
  )
}
