import React, {useEffect, useState} from 'react'
import api from '../utils/api'

export default function Profile(){
  const [profile, setProfile] = useState(null)

  useEffect(()=>{ fetch() },[])

  async function fetch(){
    try{
      const res = await api.get('/api/profile')
      setProfile(res.data)
    }catch(err){
      console.error(err)
    }
  }

  if(!profile) return <div>Chargement...</div>
  return (
    <div className='max-w-md bg-white p-4 rounded shadow mx-auto'>
      <h2 className='text-lg mb-2'>{profile.email}</h2>
      <div>Role: {profile.role}</div>
    </div>
  )
}
