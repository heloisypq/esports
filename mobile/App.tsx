import { useRef, useEffect } from 'react'
import { StatusBar } from 'react-native';
import { 
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black
} from '@expo-google-fonts/inter';
import { Subscription } from 'expo-modules-core'
import * as Notifications from 'expo-notifications';

import {Routes} from './src/routes/';
import { Background } from './src/components/Background';
import { Loading } from './src/components/Loading';

import './src/services/notificationConfigs'
import { getPushNotificationToken } from './src/services/getPushNotificationToken';

export default function App() {  

  const [ fontsLoaded ] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black
  });

  const getNotificationListeners = useRef<Subscription>();
  const responseNotificationListeners = useRef<Subscription>();

  useEffect(() => {
    getPushNotificationToken()
  })

  useEffect(()=> {
    getNotificationListeners.current = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification)
    })

    responseNotificationListeners.current = Notifications.addNotificationResponseReceivedListener(response=>{
      console.log(response)
    })

    return () => {
      if(getNotificationListeners.current && responseNotificationListeners.current) {
        Notifications.removeNotificationSubscription(getNotificationListeners.current)
        Notifications.removeNotificationSubscription(responseNotificationListeners.current)
      }
    }
  },[])

  return (
    <Background>
      <StatusBar 
      barStyle="light-content"
      backgroundColor="transparent"
      translucent
      />

      { fontsLoaded ? <Routes /> : <Loading />}
      
    </Background>
  );
}