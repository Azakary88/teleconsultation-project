import React, {useState} from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../utils/api';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PATIENT');

  async function submit(){
    try{
      await api.post('/api/auth/register', { email, password, role });
      Alert.alert('Succès', 'Compte créé, connectez-vous');
      navigation.goBack();
    }catch(err){
      console.error(err);
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  }

  return (
    <View style={{ padding:20 }}>
      <Text style={{fontSize:18, marginBottom:10}}>Inscription</Text>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" style={{borderWidth:1, padding:8, marginBottom:10}} />
      <Text>Mot de passe</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1, padding:8, marginBottom:10}} />
      <Text>Role (PATIENT or DOCTOR)</Text>
      <TextInput value={role} onChangeText={setRole} style={{borderWidth:1, padding:8, marginBottom:10}} />
      <Button title="S'inscrire" onPress={submit} />
    </View>
  )
}
