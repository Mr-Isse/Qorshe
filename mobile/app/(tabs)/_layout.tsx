import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAppSelector } from '../../src/store/store';
import { colors } from '../../src/constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return <MaterialCommunityIcons name={name} color={color} size={focused ? 25 : 23} />;
}

export default function TabsLayout() {
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  if (isLoading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  const hidden = { href: null };
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#98A2B3',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginBottom: 3 },
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E4E7EC', height: 66, paddingTop: 6 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, focused }) => <TabIcon name="home-variant-outline" color={color} focused={focused} /> }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transactions', tabBarIcon: ({ color, focused }) => <TabIcon name="swap-horizontal" color={color} focused={focused} /> }} />
      <Tabs.Screen name="budgets" options={{ title: 'Budget', tabBarIcon: ({ color, focused }) => <TabIcon name="chart-donut" color={color} focused={focused} /> }} />
      <Tabs.Screen name="savings" options={{ title: 'Savings', tabBarIcon: ({ color, focused }) => <TabIcon name="piggy-bank-outline" color={color} focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, focused }) => <TabIcon name="account-circle-outline" color={color} focused={focused} /> }} />
      <Tabs.Screen name="categories" options={hidden} />
      <Tabs.Screen name="goals" options={hidden} />
      <Tabs.Screen name="recurring-transactions" options={hidden} />
      <Tabs.Screen name="notifications" options={hidden} />
      <Tabs.Screen name="reports" options={hidden} />
      <Tabs.Screen name="assistant" options={hidden} />
      <Tabs.Screen name="debts" options={hidden} />
      <Tabs.Screen name="investments" options={hidden} />
    </Tabs>
  );
}
