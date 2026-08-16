import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { authApi } from '../../src/api/auth.api';
import { colors } from '../../src/constants/theme';

const password = z.string().min(8, 'Password-ku waa inuu ka koobnaadaa ugu yaraan 8 xaraf.').regex(/[A-Z]/, 'Password-ku waa inuu leeyahay xaraf weyn.').regex(/[a-z]/, 'Password-ku waa inuu leeyahay xaraf yar.').regex(/[0-9]/, 'Password-ku waa inuu leeyahay lambar.');
const schema = z.object({ name: z.string().min(2, 'Fadlan geli magacaaga.'), email: z.string().email('Fadlan geli email sax ah.'), phone: z.string().optional(), password, confirmPassword: z.string() }).refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Labada password isma waafaqaan.' });
type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' } });
  const [error, setError] = React.useState<string | null>(null);
  const onSubmit = async ({ confirmPassword: _confirmPassword, ...values }: FormValues) => { try { await authApi.register(values); router.replace('/(auth)/login'); } catch (err) { setError(err instanceof Error ? err.message : 'Diiwaangelintu way fashilantay.'); } };
  return <View style={styles.container}><Text style={styles.brand}>QORSHE</Text><Text style={styles.title}>Create Account</Text><Text style={styles.subtitle}>Ku bilow qorshahaaga maaliyadeed.</Text>{[['name', 'Full Name'], ['email', 'Email'], ['phone', 'Phone'], ['password', 'Password'], ['confirmPassword', 'Confirm Password']].map(([field, placeholder]) => <TextInput key={field} style={styles.input} placeholder={placeholder} secureTextEntry={field.includes('password')} autoCapitalize={field === 'email' ? 'none' : 'sentences'} onChangeText={(value) => setValue(field as keyof FormValues, value, { shouldValidate: true })} {...register(field as keyof FormValues)} />)}{Object.values(errors)[0]?.message && <Text style={styles.error}>{String(Object.values(errors)[0]?.message)}</Text>}{error && <Text style={styles.error}>{error}</Text>}<Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}><Text style={styles.buttonText}>{isSubmitting ? 'Sug...' : 'Create Account'}</Text></Pressable><Text style={styles.footer}>Hore ayaad u leedahay account? <Link href="/(auth)/login" style={styles.link}>Login</Link></Text></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background }, brand: { color: colors.primary, fontSize: 30, fontWeight: '800', letterSpacing: 2 }, title: { color: colors.navy, fontSize: 26, fontWeight: '700', marginTop: 12 }, subtitle: { color: '#52606D', marginTop: 8, marginBottom: 16 }, input: { backgroundColor: '#fff', borderColor: '#D9E2EC', borderRadius: 12, borderWidth: 1, padding: 13, marginTop: 9 }, error: { color: '#B42318', marginTop: 8 }, button: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 18 }, buttonText: { color: '#fff', fontWeight: '700' }, footer: { textAlign: 'center', color: '#52606D', marginTop: 18 }, link: { color: colors.primary, fontWeight: '600' } });
