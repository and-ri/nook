import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslations } from 'use-intl';

import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { navigationRef } from '../lib/navigationRef';
import { PushManager } from '../components/PushManager';
import { trackScreen } from '../lib/analytics';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SubscriptionDetailScreen from '../screens/SubscriptionDetailScreen';
import NewSubscriptionScreen from '../screens/NewSubscriptionScreen';
import EditSubscriptionScreen from '../screens/EditSubscriptionScreen';
import ReportsScreen from '../screens/ReportsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TeamScreen from '../screens/TeamScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Auth = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login" component={LoginScreen} />
      <Auth.Screen name="Register" component={RegisterScreen} />
      <Auth.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Auth.Navigator>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStack.Screen name="SubscriptionDetail" component={SubscriptionDetailScreen} />
      <HomeStack.Screen name="NewSubscription" component={NewSubscriptionScreen} />
      <HomeStack.Screen name="EditSubscription" component={EditSubscriptionScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

function MoreNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="Settings" component={SettingsScreen} />
      <MoreStack.Screen name="Categories" component={CategoriesScreen} />
      <MoreStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <MoreStack.Screen name="Team" component={TeamScreen} />
    </MoreStack.Navigator>
  );
}

function TabNavigator() {
  const t = useTranslations('Nav');
  const { scheme } = useTheme();
  const dark = scheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: dark ? '#fafafa' : '#171717',
        tabBarInactiveTintColor: '#a3a3a3',
        tabBarStyle: {
          borderTopColor: dark ? '#262626' : '#e5e5e5',
          backgroundColor: dark ? '#0a0a0a' : '#ffffff',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          title: t('dashboard'),
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          title: t('reports'),
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreNavigator}
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { scheme } = useTheme();

  if (loading) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={scheme === 'dark' ? DarkTheme : DefaultTheme}
      onReady={() => trackScreen(navigationRef.getCurrentRoute()?.name)}
      onStateChange={() => trackScreen(navigationRef.getCurrentRoute()?.name)}
    >
      {isAuthenticated ? (
        <>
          <TabNavigator />
          <PushManager />
        </>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
