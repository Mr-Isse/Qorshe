import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BarChart3, CreditCard, Database, PiggyBank, Receipt, RefreshCw, Target, TrendingUp, Users, WalletCards } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminBudgetApi } from '../api/budget.api';
import { adminDebtApi, type AdminDebtSummary } from '../api/debt.api';
import { adminReportApi, type AdminOverview } from '../api/report.api';
import { adminSavingsApi } from '../api/savings.api';
import { adminTransactionApi, type AdminTransaction } from '../api/transaction.api';
import { usersApi } from '../api/users.api';

type BudgetSummary = Record<string, { totalBudgets: number; activeBudgets: number; budgetsExceeded: number; budgetsNearLimit: number; totalBudgetedAmount: string; totalSpentAmount: string; totalRemainingAmount: string }>;
type SavingsSummary = Record<string, { targetAmount: string; savedAmount: string; remainingAmount: string; totalPlans: number; activePlans: number; completedPlans: number; overduePlans: number }>;
type DashboardData = { totalUsers: number; activeUsers: number; transactions: Record<string, { incomeRecords: number; expenseRecords: number; incomeTotal: string; expenseTotal: string }>; overview: Record<'USD' | 'SOS', AdminOverview>; budgets: BudgetSummary; savings: SavingsSummary; debts: AdminDebtSummary; recentTransactions: AdminTransaction[] };

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
function amount(value: string | number | undefined, currency?: string) { if (value === undefined) return '—'; return `${currency ? `${currency} ` : ''}${numberFormatter.format(Number(value))}`; }

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: typeof Users; tone: 'teal' | 'navy' | 'amber' | 'purple' }) {
  const tones = { teal: 'bg-[#E7F8F3] text-[#087D70]', navy: 'bg-[#EAF0F7] text-[#173B61]', amber: 'bg-[#FFF5DF] text-[#A66B00]', purple: 'bg-[#F1EDFF] text-[#6D51BF]' };
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-3 text-2xl font-black tracking-tight text-[#04172A]">{value}</p><p className="mt-2 text-xs text-slate-500">{detail}</p></div><div className={`rounded-xl p-3 ${tones[tone]}`}><Icon className="h-5 w-5" /></div></div></article>;
}

function Panel({ title, eyebrow, children, action }: { title: string; eyebrow?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div>{eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#14BBA6]">{eyebrow}</p>}<h2 className="mt-1 text-lg font-bold text-[#04172A]">{title}</h2></div>{action}</div>{children}</section>;
}

export function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true); setError('');
    try {
      const [users, activeUsers, transactions, overview, budgets, savings, debts, recent] = await Promise.all([
        usersApi.list({ page: 1, limit: 1 }),
        usersApi.list({ page: 1, limit: 1, status: 'ACTIVE' }),
        adminTransactionApi.summary(),
        adminReportApi.overview({ period: 'THIS_MONTH' }),
        adminBudgetApi.summary(),
        adminSavingsApi.summary(),
        adminDebtApi.summary(),
        adminTransactionApi.list({ page: 1, limit: 6 }),
      ]);
      setData({ totalUsers: users.pagination.total, activeUsers: activeUsers.pagination.total, transactions, overview, budgets, savings, debts, recentTransactions: recent.data });
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard data.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadDashboard(); }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    return (['USD', 'SOS'] as const).map((currency) => ({ currency, income: Number(data.overview[currency]?.totalIncome ?? 0), expenses: Number(data.overview[currency]?.totalExpenses ?? 0) }));
  }, [data]);
  const activeDebts = data ? (data.debts.USD.I_OWE.activeCount + data.debts.USD.OWED_TO_ME.activeCount + data.debts.SOS.I_OWE.activeCount + data.debts.SOS.OWED_TO_ME.activeCount) : 0;
  const activeSavings = data ? data.savings.USD.activePlans + data.savings.SOS.activePlans : 0;
  const activeBudgets = data ? data.budgets.USD.activeBudgets + data.budgets.SOS.activeBudgets : 0;
  const totalTransactions = data ? Object.values(data.transactions).reduce((sum, item) => sum + item.incomeRecords + item.expenseRecords, 0) : 0;

  if (loading) return <div className="p-5 sm:p-8"><div className="mb-8 h-24 animate-pulse rounded-2xl bg-slate-200/70" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />)}</div></div>;
  if (error) return <div className="p-5 sm:p-8"><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"><p className="font-semibold">Dashboard data could not be loaded.</p><p className="mt-2 text-sm">{error}</p><button type="button" onClick={() => void loadDashboard()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"><RefreshCw className="h-4 w-4" /> Try again</button></div></div>;
  if (!data) return null;

  return <div className="p-5 sm:p-8"><div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#14BBA6]">Operations overview</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#04172A] sm:text-4xl">Good morning, Admin.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">A clear view of QORSHE activity, adoption, and financial operations for the current month.</p></div><button type="button" onClick={() => void loadDashboard()} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:border-[#14BBA6] hover:text-[#087D70]"><RefreshCw className="h-4 w-4" /> Refresh data</button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total users" value={numberFormatter.format(data.totalUsers)} detail={`${numberFormatter.format(data.activeUsers)} active accounts`} icon={Users} tone="teal" />
      <MetricCard label="Transactions" value={numberFormatter.format(totalTransactions)} detail="Across tracked currencies" icon={Receipt} tone="navy" />
      <MetricCard label="Active budgets" value={numberFormatter.format(activeBudgets)} detail={`${numberFormatter.format(data.budgets.USD.budgetsExceeded + data.budgets.SOS.budgetsExceeded)} over limit`} icon={WalletCards} tone="amber" />
      <MetricCard label="Active savings" value={numberFormatter.format(activeSavings)} detail={`${numberFormatter.format(data.savings.USD.completedPlans + data.savings.SOS.completedPlans)} completed plans`} icon={PiggyBank} tone="purple" />
      <MetricCard label="Active debts" value={numberFormatter.format(activeDebts)} detail={`${numberFormatter.format(data.debts.USD.I_OWE.overdueCount + data.debts.USD.OWED_TO_ME.overdueCount + data.debts.SOS.I_OWE.overdueCount + data.debts.SOS.OWED_TO_ME.overdueCount)} overdue`} icon={CreditCard} tone="amber" />
      <MetricCard label="USD income" value={amount(data.overview.USD.totalIncome, 'USD')} detail="This month" icon={ArrowUpRight} tone="teal" />
      <MetricCard label="USD expenses" value={amount(data.overview.USD.totalExpenses, 'USD')} detail="This month" icon={ArrowDownRight} tone="purple" />
      <MetricCard label="System activity" value={numberFormatter.format(data.recentTransactions.length)} detail="Recent transactions shown" icon={Database} tone="navy" />
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]"><Panel title="Income versus expenses" eyebrow="Current month" action={<span className="rounded-full bg-[#E7F8F3] px-3 py-1 text-xs font-semibold text-[#087D70]">USD / SOS separated</span>}><div className="h-[310px] w-full">{chartData.every((row) => row.income === 0 && row.expenses === 0) ? <div className="flex h-full items-center justify-center text-sm text-slate-400">No financial data available yet.</div> : <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} barGap={10}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" /><XAxis dataKey="currency" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} /><Tooltip formatter={(value) => numberFormatter.format(Number(value))} cursor={{ fill: '#F8FAFA' }} /><Legend /><Bar dataKey="income" name="Income" fill="#14BBA6" radius={[6, 6, 0, 0]} /><Bar dataKey="expenses" name="Expenses" fill="#04172A" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>}</div></Panel><Panel title="Operational pulse" eyebrow="Live aggregates"><div className="space-y-4"><div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-[#14BBA6]" /><span className="text-sm font-medium text-slate-600">Net USD balance</span></div><span className="font-bold text-[#04172A]">{amount(data.overview.USD.netBalance, 'USD')}</span></div><div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-3"><Target className="h-5 w-5 text-[#6D51BF]" /><span className="text-sm font-medium text-slate-600">Net SOS balance</span></div><span className="font-bold text-[#04172A]">{amount(data.overview.SOS.netBalance, 'SOS')}</span></div><div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-[#A66B00]" /><span className="text-sm font-medium text-slate-600">Transaction volume</span></div><span className="font-bold text-[#04172A]">{numberFormatter.format(totalTransactions)}</span></div></div></Panel></div>
    <div className="mt-6"><Panel title="Recent transactions" eyebrow="Latest system activity" action={<span className="text-xs text-slate-400">Read-only preview</span>}>{data.recentTransactions.length === 0 ? <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No data available yet.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-[0.12em] text-slate-400"><th className="px-3 py-3 font-semibold">Transaction</th><th className="px-3 py-3 font-semibold">User</th><th className="px-3 py-3 font-semibold">Type</th><th className="px-3 py-3 font-semibold">Amount</th><th className="px-3 py-3 font-semibold">Date</th></tr></thead><tbody>{data.recentTransactions.map((transaction) => <tr key={transaction.id} className="border-b border-slate-50 last:border-0"><td className="px-3 py-4"><p className="font-semibold text-[#04172A]">{transaction.title}</p><p className="text-xs text-slate-400">{transaction.category?.name ?? 'Uncategorized'}</p></td><td className="px-3 py-4"><p className="text-sm text-slate-600">{transaction.user.name}</p><p className="text-xs text-slate-400">{transaction.user.email}</p></td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${transaction.type === 'INCOME' ? 'bg-[#E7F8F3] text-[#087D70]' : 'bg-[#FFF0F0] text-[#B42318]'}`}>{transaction.type}</span></td><td className="px-3 py-4 font-semibold text-[#04172A]">{transaction.currency} {transaction.amount}</td><td className="px-3 py-4 text-sm text-slate-500">{new Date(transaction.date).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</Panel></div>
  </div>;
}
