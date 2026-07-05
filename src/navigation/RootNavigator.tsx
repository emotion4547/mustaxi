import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '@/theme';
import { useApp } from '@/store/AppContext';
import type { MainTabParamList, RootStackParamList } from './types';

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
const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcon = (glyph: string) => ({ color }: { color: string }) =>
  <Text style={{ fontSize: 20, color }}>{glyph}</Text>;

function MainTabs() {
  const { t } = useApp();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('tabs.home'), tabBarIcon: tabIcon('🚕') }}
      />
      <Tab.Screen
        name="Prayer"
        component={PrayerScreen}
        options={{ title: t('tabs.prayer'), tabBarIcon: tabIcon('🕌') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('tabs.profile'), tabBarIcon: tabIcon('👤') }}
      />
    </Tab.Navigator>
  );
}

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, bootstrapping } = useApp();

  if (bootstrapping) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 56 }}>🕌</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
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
