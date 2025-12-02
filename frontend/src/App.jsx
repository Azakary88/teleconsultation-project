import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Doctors from './pages/Doctors'
import CreateAppointment from './pages/CreateAppointment'
import Appointments from './pages/Appointments'
import Profile from './pages/Profile'
import { useTranslation } from 'react-i18next'
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PrivateRoute from './components/PrivateRoute';



export default function App(){
  const { t } = useTranslation()
  return (
    <div>
      <header className='bg-white shadow'>
        <div className='max-w-4xl mx-auto p-4 flex items-center gap-4'>
          <h1 className='text-xl font-semibold'>{t('appTitle')}</h1>
          <nav className='ml-auto flex gap-2'>
            <Link to='/' className='px-3 py-1 rounded hover:bg-gray-100'>{t('home')}</Link>
            <Link to='/doctors' className='px-3 py-1 rounded hover:bg-gray-100'>{t('doctors')}</Link>
            <Link to='/appointments' className='px-3 py-1 rounded hover:bg-gray-100'>{t('appointments')}</Link>
            <Link to='/profile' className='px-3 py-1 rounded hover:bg-gray-100'>{t('profile')}</Link>
          </nav>
        </div>
      </header>
      <main className='max-w-4xl mx-auto p-4'>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<Register/>} />
          <Route path="/doctor-dashboard" element={<PrivateRoute role="DOCTOR"><DoctorDashboard/></PrivateRoute>} />
          <Route path="/patient-dashboard" element={<PrivateRoute role="PATIENT"><PatientDashboard/></PrivateRoute>} />
          <Route path='/doctors' element={<Doctors/>} />
          <Route path='/create-appointment' element={<CreateAppointment/>} />
          <Route path='/appointments' element={<Appointments/>} />
          <Route path='/profile' element={<Profile/>} />
        </Routes>
      </main>
    </div>
  )
}



// dans <Routes> :
