import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../src/store/store';
import '../global.css';
const queryClient = new QueryClient();
export default function RootLayout() { return <Provider store={store}><QueryClientProvider client={queryClient}><Stack screenOptions={{ headerShown: false }} /></QueryClientProvider></Provider>; }
