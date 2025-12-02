import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import api from '../utils/api';

export default function DoctorsScreen({ navigation }){
  const [doctors, setDoctors] = useState([]);

  useEffect(()=>{ fetchDoctors() },[]);

  async function fetchDoctors(){
    try{
      const res = await api.get('/api/doctors');
      setDoctors(res.data || []);
    }catch(err){
      console.error(err);
    }
  }

  return (
    <View style={{ padding:10 }}>
      <Text style={{ fontSize:18, marginBottom:10 }}>Médecins</Text>
      <FlatList data={doctors} keyExtractor={item=>String(item.id)} renderItem={({item})=>(
        <TouchableOpacity onPress={()=>navigation.navigate('CreateAppointment', { doctor: item })} style={{padding:10, borderWidth:1, marginBottom:8}}>
          <Text style={{fontWeight:'bold'}}>{item.firstname || item.name || item.email}</Text>
          <Text>{item.specialty || ''}</Text>
        </TouchableOpacity>
      )} />
    </View>
  )
}
