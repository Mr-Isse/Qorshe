import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { reportApi } from '../../src/api/report.api';
import { savingsApi } from '../../src/api/savings.api';
import { transactionApi } from '../../src/api/transaction.api';
import { colors } from '../../src/constants/theme';
import { useAppSelector } from '../../src/store/store';
import { EmptyState, ErrorState, PageSkeleton, ScreenContainer, SectionHeader } from '../../src/components/ui';

const currencyOptions = ['USD', 'SOS'] as const;
type Currency = (typeof currencyOptions)[number];

function money(value: string | number | undefined, currency: Currency) {
  return `${currency} ${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Home() {
  const user = useAppSelector((state) => state.auth.user);
  const [currency, setCurrency] = React.useState<Currency>('USD');
  const summary = useQuery({ queryKey: ['home-summary', currency], queryFn: () => reportApi.overview({ period: 'THIS_MONTH', currency }) });
  const transactions = useQuery({ queryKey: ['home-transactions', currency], queryFn: () => transactionApi.list({ page: 1, limit: 5, currency }) });
  const savings = useQuery({ queryKey: ['home-savings', currency], queryFn: savingsApi.summary });
  const overview = summary.data?.[currency];
  const recent = transactions.data?.data ?? [];
  const loading = summary.isLoading || transactions.isLoading || savings.isLoading;
  const failed = summary.isError || transactions.isError || savings.isError;
  const refetchAll = () => { void summary.refetch(); void transactions.refetch(); void savings.refetch(); };

  if (loading) return <ScreenContainer><PageSkeleton rows={5} /></ScreenContainer>;
  if (failed) return <ScreenContainer><ErrorState onRetry={refetchAll} message="We couldn't load your financial overview." /></ScreenContainer>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>QORSHE</Text><Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')[0] ?? 'there'}</Text><Text style={styles.subtitle}>Your money, clearly in view.</Text></View>
        <Pressable style={styles.avatar} onPress={() => router.push('/(tabs)/profile')}><Text style={styles.avatarText}>{(user?.name?.[0] ?? 'U').toUpperCase()}</Text></Pressable>
      </View>
      <View style={styles.currencyRow}>{currencyOptions.map((option) => <Pressable key={option} onPress={() => setCurrency(option)} style={[styles.currency, currency === option && styles.currencyActive]}><Text style={[styles.currencyText, currency === option && styles.currencyActiveText]}>{option}</Text></Pressable>)}</View>
      <View style={styles.balanceCard}><View style={styles.balanceTop}><Text style={styles.balanceLabel}>This month</Text><MaterialCommunityIcons name="chart-line" size={22} color="#A7F3D0" /></View><Text style={styles.balance}>{money(overview?.netBalance, currency)}</Text><Text style={styles.balanceHint}>Net balance after income and expenses</Text><View style={styles.metricRow}><Metric label="Income" value={money(overview?.totalIncome, currency)} color="#D1FAE5" /><Metric label="Expenses" value={money(overview?.totalExpenses, currency)} color="#FECACA" /></View></View>
      <SectionHeader title="Quick actions" />
      <View style={styles.quickGrid}><QuickAction icon="arrow-down-bold" label="Add income" color={colors.income} onPress={() => router.push('/(tabs)/transactions')} /><QuickAction icon="arrow-up-bold" label="Add expense" color={colors.expense} onPress={() => router.push('/(tabs)/transactions')} /><QuickAction icon="piggy-bank-outline" label="Add savings" color={colors.savings} onPress={() => router.push('/(tabs)/savings')} /><QuickAction icon="chart-donut" label="Add budget" color={colors.budget} onPress={() => router.push('/(tabs)/budgets')} /></View>
      <SectionHeader title="Savings progress" action="View all" onAction={() => router.push('/(tabs)/savings')} />
      <View style={styles.card}><Text style={styles.cardLabel}>Saved toward goals</Text><Text style={styles.cardValue}>{money(savings.data?.[currency]?.savedAmount, currency)}</Text><Text style={styles.cardHint}>of {money(savings.data?.[currency]?.targetAmount, currency)} target</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min((Number(savings.data?.[currency]?.savedAmount ?? 0) / Math.max(Number(savings.data?.[currency]?.targetAmount ?? 1), 1)) * 100, 100)}%` }]} /></View></View>
      <SectionHeader title="Recent transactions" action="See all" onAction={() => router.push('/(tabs)/transactions')} />
      {recent.length === 0 ? <EmptyState title="No transactions yet" message="Start tracking income and expenses to see your activity here." actionLabel="Add transaction" onAction={() => router.push('/(tabs)/transactions')} /> : recent.map((item) => <View key={item.id} style={styles.transaction}><View style={[styles.transactionIcon, { backgroundColor: item.type === 'INCOME' ? '#D1FAE5' : '#FEE4E2' }]}><MaterialCommunityIcons name={item.type === 'INCOME' ? 'arrow-down' : 'arrow-up'} size={18} color={item.type === 'INCOME' ? colors.income : colors.expense} /></View><View style={styles.transactionInfo}><Text style={styles.transactionTitle}>{item.title}</Text><Text style={styles.transactionMeta}>{item.category?.name ?? 'Uncategorized'} · {new Date(item.date).toLocaleDateString()}</Text></View><Text style={[styles.transactionAmount, { color: item.type === 'INCOME' ? colors.income : colors.expense }]}>{item.type === 'INCOME' ? '+' : '-'}{money(item.amount, currency)}</Text></View>)}
    </ScreenContainer>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, { color }]}>{value}</Text></View>; }
function QuickAction({ icon, label, color, onPress }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; color: string; onPress: () => void }) { return <Pressable style={styles.quick} onPress={onPress}><View style={[styles.quickIcon, { backgroundColor: `${color}20` }]}><MaterialCommunityIcons name={icon} size={22} color={color} /></View><Text style={styles.quickLabel}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({ header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, eyebrow: { color: colors.secondary, fontSize: 12, fontWeight: '900', letterSpacing: 2 }, greeting: { color: colors.navy, fontSize: 25, fontWeight: '800', marginTop: 5 }, subtitle: { color: '#667085', marginTop: 5 }, avatar: { alignItems: 'center', backgroundColor: colors.navy, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 }, avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' }, currencyRow: { flexDirection: 'row', gap: 8, marginTop: 20 }, currency: { borderColor: '#D0D5DD', borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 }, currencyActive: { backgroundColor: colors.primary, borderColor: colors.primary }, currencyText: { color: colors.navy, fontSize: 12, fontWeight: '800' }, currencyActiveText: { color: '#FFFFFF' }, balanceCard: { backgroundColor: colors.navy, borderRadius: 22, marginTop: 16, padding: 20 }, balanceTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, balanceLabel: { color: '#A7F3D0', fontWeight: '700' }, balance: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', marginTop: 12 }, balanceHint: { color: '#B8C5D1', fontSize: 12, marginTop: 6 }, metricRow: { flexDirection: 'row', gap: 12, marginTop: 20 }, metric: { backgroundColor: '#FFFFFF18', borderRadius: 14, flex: 1, padding: 12 }, metricLabel: { color: '#B8C5D1', fontSize: 12 }, metricValue: { fontSize: 14, fontWeight: '900', marginTop: 5 }, quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, quick: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, flexBasis: '47%', flexGrow: 1, padding: 14 }, quickIcon: { alignItems: 'center', borderRadius: 14, height: 42, justifyContent: 'center', width: 42 }, quickLabel: { color: colors.navy, fontSize: 12, fontWeight: '800', marginTop: 8 }, card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18 }, cardLabel: { color: '#667085', fontSize: 12, fontWeight: '700' }, cardValue: { color: colors.navy, fontSize: 22, fontWeight: '900', marginTop: 5 }, cardHint: { color: '#667085', marginTop: 5 }, progressTrack: { backgroundColor: '#E4E7EC', borderRadius: 6, height: 9, marginTop: 15, overflow: 'hidden' }, progressFill: { backgroundColor: colors.savings, borderRadius: 6, height: 9 }, transaction: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, flexDirection: 'row', marginBottom: 9, padding: 13 }, transactionIcon: { alignItems: 'center', borderRadius: 12, height: 38, justifyContent: 'center', width: 38 }, transactionInfo: { flex: 1, marginLeft: 11 }, transactionTitle: { color: colors.navy, fontSize: 13, fontWeight: '800' }, transactionMeta: { color: '#667085', fontSize: 11, marginTop: 4 }, transactionAmount: { fontSize: 12, fontWeight: '900' } });
