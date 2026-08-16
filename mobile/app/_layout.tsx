import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, useAppDispatch } from '../src/store/store';
import { restoreSession } from '../src/store/slices/authSlice';
import '../global.css';

const queryClient = new QueryClient();

function SessionBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(restoreSession()); }, [dispatch]);
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return <Provider store={store}><QueryClientProvider client={queryClient}><SessionBootstrap /></QueryClientProvider></Provider>;
}
