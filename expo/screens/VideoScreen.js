import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function VideoScreen({ route }){
  const { room } = route.params || {};
  const url = room ? `https://meet.jit.si/${room}` : 'https://meet.jit.si/demo';
  return (
    <View style={{ flex:1 }}>
      <WebView source={{ uri: url }} style={{ flex:1 }} />
    </View>
  )
}
