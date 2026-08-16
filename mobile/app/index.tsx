import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAppSelector } from '../src/store/store';

export default function Index() {
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  if (isLoading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}
