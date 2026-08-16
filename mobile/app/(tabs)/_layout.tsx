import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAppSelector } from '../../src/store/store';

export default function TabsLayout() {
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  if (isLoading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <Tabs><Tabs.Screen name="index" options={{ title: 'Home' }} /><Tabs.Screen name="profile" options={{ title: 'Profile' }} /><Tabs.Screen name="categories" options={{ title: 'Categories' }} /><Tabs.Screen name="transactions" options={{ title: 'Transactions' }} /></Tabs>;
}
