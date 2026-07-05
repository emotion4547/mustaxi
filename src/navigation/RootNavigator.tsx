import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useApp } from '@/store/AppContext';
import { Preloader } from '@/components/Preloader';
import type { RootStackParamList } from './types';

import { LoginScreen } from '@/screens/LoginScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { PrayerScreen } from '@/screens/PrayerScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { OrderScreen } from '@/screens/OrderScreen';
import { RideScreen } from '@/screens/RideScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { RideDetailsScreen } from '@/screens/RideDetailsScreen';
import { SearchLocationScreen } from '@/screens/SearchLocationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, bootstrapping } = useApp();

  if (bootstrapping) {
    return <Preloader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Prayer"
              component={PrayerScreen}
              options={{ headerShown: true, title: '' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: true, title: '' }}
            />
            <Stack.Screen
              name="Order"
              component={OrderScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="Ride" component={RideScreen} />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ headerShown: true, title: '' }}
            />
            <Stack.Screen
              name="RideDetails"
              component={RideDetailsScreen}
              options={{ headerShown: true, title: '' }}
            />
            <Stack.Screen
              name="SearchLocation"
              component={SearchLocationScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
