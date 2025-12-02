import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }){
  return (
    <View style={{ padding:20 }}>
      <Text style={{ fontSize:18, marginBottom:10 }}>Accueil</Text>
      <Button title="Voir médecins" onPress={()=>navigation.navigate('Doctors')} />
      <View style={{height:10}}/>
      <Button title="Prendre RDV" onPress={()=>navigation.navigate('Doctors')} />
      <View style={{height:10}}/>
      <Button title="Mes RDV" onPress={()=>navigation.navigate('Appointments')} />
    </View>
  )
}
