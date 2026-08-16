import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'qorshe.accessToken';
const REFRESH_TOKEN_KEY = 'qorshe.refreshToken';

export async function saveSession(accessToken: string, refreshToken: string) {
  await Promise.all([SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken), SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)]);
}

export async function getSession() {
  const [accessToken, refreshToken] = await Promise.all([SecureStore.getItemAsync(ACCESS_TOKEN_KEY), SecureStore.getItemAsync(REFRESH_TOKEN_KEY)]);
  return { accessToken, refreshToken };
}

export async function clearSession() {
  await Promise.all([SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY), SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)]);
}
