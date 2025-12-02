import * as SecureStore from 'expo-secure-store';
import api from './api';

export async function storeTokens(accessToken, refreshToken){
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
}

export async function getStoredTokens(){
  const accessToken = await SecureStore.getItemAsync('accessToken');
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  return { accessToken, refreshToken };
}

export async function clearTokens(){
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}

export async function getProfile(){
  try{
    const res = await api.get('/api/profile');
    return res.data;
  }catch(err){
    console.error(err);
    return null;
  }
}
