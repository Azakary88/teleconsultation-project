import React, {useState} from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../utils/api';
import { storeTokens } from '../utils/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(){
    try{
      const res = await api.post('/api/auth/login', { email, password });
      const { accessToken, refreshToken } = res.data;
      await storeTokens(accessToken, refreshToken);
      Alert.alert('Succès', 'Connecté');
      navigation.replace('Home');
    }catch(err){
      console.error(err);
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  }

  return (
    <View style={{ padding:20 }}>
      <Text style={{fontSize:18, marginBottom:10}}>Connexion</Text>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" style={{borderWidth:1, padding:8, marginBottom:10}} />
      <Text>Mot de passe</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1, padding:8, marginBottom:10}} />
      <Button title="Se connecter" onPress={submit} />
      <View style={{height:10}}/>
      <Button title="S'inscrire" onPress={()=>navigation.navigate('Register')} />
    </View>
  )
}
