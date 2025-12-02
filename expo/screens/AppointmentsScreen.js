import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import api from '../utils/api';
import { getProfile } from '../utils/auth';

export default function AppointmentsScreen(){
  const [appts, setAppts] = useState([]);

  useEffect(()=>{ fetchAppts() },[]);

  async function fetchAppts(){
    try{
      const profile = await getProfile();
      const res = await api.get('/api/appointments' + (profile ? ('?userId='+profile.id) : ''));
      setAppts(res.data || []);
    }catch(err){
      console.error(err);
      Alert.alert('Info', "Impossible de récupérer les RDV. Vérifie que GET /api/appointments existe.");
    }
  }

  return (
    <View style={{ padding:10 }}>
      <Text style={{ fontSize:18, marginBottom:10 }}>Mes RDV</Text>
      <FlatList data={appts} keyExtractor={item=>String(item.id)} renderItem={({item})=>(
        <View style={{padding:10, borderWidth:1, marginBottom:8}}>
          <Text>{item.start_time || item.startTime}</Text>
          <Text>{item.status}</Text>
        </View>
      )} ListEmptyComponent={<Text>Aucun RDV (ou endpoint manquant)</Text>} />
    </View>
  )
}
