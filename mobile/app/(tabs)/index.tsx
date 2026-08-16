import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/constants/theme';
import { logout } from '../../src/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../src/store/store';

export default function Home() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  async function handleLogout() { await dispatch(logout()); router.replace('/(auth)/login'); }
  return <View style={styles.container}><Text style={styles.title}>QORSHE</Text><Text style={styles.subtitle}>Ku soo dhawoow, {user?.name}.</Text><Text style={styles.note}>Authentication foundation is ready. Financial modules will be added later.</Text><Pressable style={styles.button} onPress={handleLogout}><Text style={styles.buttonText}>Logout</Text></Pressable></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, paddingHorizontal: 24 }, title: { color: colors.navy, fontSize: 36, fontWeight: '700' }, subtitle: { color: colors.secondary, fontSize: 18, fontWeight: '600', marginTop: 14 }, note: { color: '#52606D', textAlign: 'center', marginTop: 12 }, button: { backgroundColor: colors.primary, borderRadius: 12, marginTop: 24, paddingHorizontal: 28, paddingVertical: 14 }, buttonText: { color: '#fff', fontWeight: '700' } });
