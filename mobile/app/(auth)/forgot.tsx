import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { authApi } from '../../src/api/auth.api';
import { colors } from '../../src/constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function submit() { setError(''); try { const result = await authApi.forgotPassword(email); setMessage(result.message || 'Haddii account-ku jiro, fariimaha reset-ka waa la diri doonaa.'); } catch (err) { setError(err instanceof Error ? err.message : 'Codsiga wuu fashilmay.'); } }
  return <View style={styles.container}><Text style={styles.brand}>QORSHE</Text><Text style={styles.title}>Forgot Password</Text><Text style={styles.subtitle}>Geli email-kaaga si aad u bilowdo reset-ka.</Text><TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />{message && <Text style={styles.success}>{message}</Text>}{error && <Text style={styles.error}>{error}</Text>}<Pressable style={styles.button} onPress={submit}><Text style={styles.buttonText}>Send Instructions</Text></Pressable><Pressable onPress={() => router.replace('/(auth)/login')}><Text style={styles.link}>Ku noqo Login</Text></Pressable></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background }, brand: { color: colors.primary, fontSize: 30, fontWeight: '800' }, title: { color: colors.navy, fontSize: 26, fontWeight: '700', marginTop: 16 }, subtitle: { color: '#52606D', marginVertical: 18 }, input: { backgroundColor: '#fff', borderColor: '#D9E2EC', borderRadius: 12, borderWidth: 1, padding: 14 }, button: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 18 }, buttonText: { color: '#fff', fontWeight: '700' }, link: { color: colors.primary, fontWeight: '600', textAlign: 'center', marginTop: 20 }, success: { color: '#027A48', marginTop: 12 }, error: { color: '#B42318', marginTop: 12 } });
