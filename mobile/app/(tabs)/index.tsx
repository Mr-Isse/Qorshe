import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>QORSHE</Text>
      <Text style={styles.subtitle}>Your personal finance foundation is ready.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFA', paddingHorizontal: 24 },
  title: { color: '#04172A', fontSize: 36, fontWeight: '700' },
  subtitle: { color: '#52606D', fontSize: 16, marginTop: 12, textAlign: 'center' },
});
