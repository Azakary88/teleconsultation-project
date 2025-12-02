import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  fr: {
    translation: {
      appTitle: 'Téléconsultation',
      home: 'Accueil',
      login: 'Connexion',
      register: 'Inscription',
      doctors: 'Médecins',
      appointments: 'Rendez-vous',
      takeAppointment: 'Prendre RDV',
      profile: 'Profil',
      logout: 'Déconnexion'
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  interpolation: { escapeValue: false }
})

export default i18n
