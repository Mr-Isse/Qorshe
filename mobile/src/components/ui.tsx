import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

export function ScreenContainer({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const content = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

export function SkeletonBlock({ width = '100%', height = 18, radius = 10 }: { width?: number | `${number}%`; height?: number; radius?: number }) {
  return <View style={[styles.skeleton, { width, height, borderRadius: radius }]} />;
}

export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View style={styles.skeletonPage}>
      <SkeletonBlock width="45%" height={28} />
      <SkeletonBlock width="75%" height={16} />
      <View style={styles.skeletonCard}>
        <SkeletonBlock width="50%" height={18} />
        <SkeletonBlock width="70%" height={30} />
        <SkeletonBlock width="100%" height={10} />
      </View>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.skeletonRow}>
          <SkeletonBlock width={44} height={44} radius={14} />
          <View style={styles.skeletonText}>
            <SkeletonBlock width="80%" />
            <SkeletonBlock width="55%" height={13} />
          </View>
          <SkeletonBlock width={60} height={16} />
        </View>
      ))}
    </View>
  );
}

export function EmptyState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.state}>
      <View style={styles.stateIcon}><Text style={styles.stateIconText}>◌</Text></View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateMessage}>{message}</Text>
      {actionLabel && onAction ? <Pressable style={styles.primaryButton} onPress={onAction}><Text style={styles.primaryText}>{actionLabel}</Text></Pressable> : null}
    </View>
  );
}

export function ErrorState({ onRetry, message = 'Something went wrong. Please try again.' }: { onRetry?: () => void; message?: string }) {
  return (
    <View style={styles.state}>
      <View style={[styles.stateIcon, styles.errorIcon]}><Text style={styles.stateIconText}>!</Text></View>
      <Text style={styles.stateTitle}>Unable to load</Text>
      <Text style={styles.stateMessage}>{message}</Text>
      {onRetry ? <Pressable style={styles.secondaryButton} onPress={onRetry}><Text style={styles.secondaryText}>Try again</Text></Pressable> : null}
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action && onAction ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: { padding: 20, paddingBottom: 36 },
  skeletonPage: { gap: 12 },
  skeleton: { backgroundColor: '#E5E7EB' },
  skeletonCard: { backgroundColor: '#FFFFFF', borderRadius: 20, gap: 14, marginTop: 10, padding: 18 },
  skeletonRow: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, flexDirection: 'row', gap: 12, padding: 14 },
  skeletonText: { flex: 1, gap: 8 },
  state: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 44 },
  stateIcon: { alignItems: 'center', backgroundColor: '#D1FAE5', borderRadius: 24, height: 48, justifyContent: 'center', marginBottom: 12, width: 48 },
  errorIcon: { backgroundColor: '#FEE4E2' },
  stateIconText: { color: colors.primary, fontSize: 26, fontWeight: '800' },
  stateTitle: { color: colors.navy, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  stateMessage: { color: '#667085', lineHeight: 20, marginTop: 7, textAlign: 'center' },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 12, marginTop: 18, paddingHorizontal: 18, paddingVertical: 12 },
  primaryText: { color: '#FFFFFF', fontWeight: '800' },
  secondaryButton: { borderColor: '#CBD5E1', borderRadius: 12, borderWidth: 1, marginTop: 18, paddingHorizontal: 18, paddingVertical: 12 },
  secondaryText: { color: colors.navy, fontWeight: '800' },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, marginTop: 24 },
  sectionTitle: { color: colors.navy, fontSize: 18, fontWeight: '800' },
  sectionAction: { color: colors.primary, fontSize: 13, fontWeight: '800' },
});
