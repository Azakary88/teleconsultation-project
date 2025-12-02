import React, {useState} from 'react'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('PATIENT')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      await api.post('/api/auth/register', { email, password, role })
      alert('Compte créé, connectez-vous')
      navigate('/login')
    }catch(err){
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className='max-w-md mx-auto bg-white p-4 rounded shadow'>
      <h2 className='text-lg mb-2'>Inscription</h2>
      <form onSubmit={submit} className='flex flex-col gap-2'>
        <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} className='border p-2 rounded' />
        <input placeholder='Mot de passe' type='password' value={password} onChange={e=>setPassword(e.target.value)} className='border p-2 rounded' />
        <select value={role} onChange={e=>setRole(e.target.value)} className='border p-2 rounded'>
          <option value='PATIENT'>Patient</option>
          <option value='DOCTOR'>Médecin</option>
        </select>
        <button className='bg-green-600 text-white px-4 py-2 rounded'>S'inscrire</button>
      </form>
    </div>
  )
}
