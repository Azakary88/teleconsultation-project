import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  const cards = [
    { title: 'Médecins', to: '/doctors', desc: 'Consulter la liste des médecins' },
    { title: 'Mes RDV', to: '/appointments', desc: 'Voir vos rendez-vous' },
    { title: 'Prendre RDV', to: '/create-appointment', desc: 'Créer un nouveau rendez-vous' },
    { title: 'Profil', to: '/profile', desc: 'Voir votre profil' },
  ]

  return (
    <div className='max-w-4xl mx-auto p-4 grid gap-4'>
      <h2 className='text-2xl font-semibold mb-4'>Accueil</h2>
      <div className='grid md:grid-cols-2 gap-4'>
        {cards.map(c=>(
          <Link key={c.to} to={c.to} className='p-4 bg-white shadow rounded hover:shadow-md'>
            <h3 className='font-semibold'>{c.title}</h3>
            <p className='text-sm text-gray-600'>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
