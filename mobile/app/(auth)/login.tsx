import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../src/store/store';
import { login } from '../../src/store/slices/authSlice';
import { colors } from '../../src/constants/theme';

const schema = z.object({ email: z.string().email('Fadlan geli email sax ah.'), password: z.string().min(1, 'Fadlan geli password-ka.') });
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
  const onSubmit = async (values: FormValues) => { const result = await dispatch(login(values)); if (login.fulfilled.match(result)) router.replace('/(tabs)'); };
  return <View style={styles.container}><Text style={styles.brand}>QORSHE</Text><Text style={styles.title}>Ku soo dhawoow Qorshe</Text><Text style={styles.subtitle}>Maamul dhaqaalahaaga si fudud.</Text><TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" onChangeText={(value) => setValue('email', value, { shouldValidate: true })} {...register('email')} />{errors.email && <Text style={styles.error}>{errors.email.message}</Text>}<TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={(value) => setValue('password', value, { shouldValidate: true })} {...register('password')} />{errors.password && <Text style={styles.error}>{errors.password.message}</Text>}{error && <Text style={styles.error}>{error.includes('Invalid') ? 'Email-ka ama password-ka ayaa khaldan.' : error}</Text>}<Link href="/(auth)/forgot" style={styles.link}>Forgot Password?</Link><Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isLoading}><Text style={styles.buttonText}>{isLoading ? 'Sug...' : 'Login'}</Text></Pressable><Text style={styles.footer}>Ma lihid account? <Link href="/(auth)/register" style={styles.link}>Create Account</Link></Text></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background }, brand: { color: colors.primary, fontSize: 32, fontWeight: '800', letterSpacing: 2 }, title: { color: colors.navy, fontSize: 26, fontWeight: '700', marginTop: 16 }, subtitle: { color: '#52606D', marginTop: 8, marginBottom: 28 }, input: { backgroundColor: '#fff', borderColor: '#D9E2EC', borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 12 }, error: { color: '#B42318', marginTop: 6, fontSize: 13 }, link: { color: colors.primary, fontWeight: '600', marginTop: 12 }, button: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 22 }, buttonText: { color: '#fff', fontWeight: '700' }, footer: { textAlign: 'center', color: '#52606D', marginTop: 24 } });
