import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../utils/api';
import { getProfile } from '../utils/auth';

export default function CreateAppointmentScreen({ route, navigation }) {
  const doctor = route.params?.doctor;
  const [startTime, setStartTime] = useState('');

  async function submit(){
    try{
      const profile = await getProfile();
      if(!profile) return Alert.alert('Erreur', 'Profil introuvable');
      const res = await api.post('/api/appointments', { patientId: profile.id, doctorId: doctor.id, startTime });
      Alert.alert('Succès', 'RDV créé');
      navigation.navigate('Appointments');
    }catch(err){
      console.error(err);
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  }

  return (
    <View style={{ padding:20 }}>
      <Text>Prendre RDV avec: {doctor?.firstname || doctor?.name || doctor?.email}</Text>
      <Text>StartTime (ISO string)</Text>
      <TextInput value={startTime} onChangeText={setStartTime} placeholder="2025-12-01T10:00:00Z" style={{borderWidth:1, padding:8, marginVertical:10}} />
      <Button title="Créer RDV" onPress={submit} />
    </View>
  )
}
