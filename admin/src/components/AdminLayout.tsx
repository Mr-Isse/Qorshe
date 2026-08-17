import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Receipt,
  Settings,
  ShieldCheck,
  Target,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { adminLogout } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/store';

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/users', icon: Users },
  { label: 'Categories', to: '/categories', icon: CircleDollarSign },
  { label: 'Transactions', to: '/transactions', icon: Receipt },
  { label: 'Budgets', to: '/budgets', icon: WalletCards },
  { label: 'Savings', to: '/savings', icon: PiggyBank },
  { label: 'Goals', to: '/goals', icon: Target },
  { label: 'Recurring Transactions', to: '/recurring-transactions', icon: CreditCard },
  { label: 'Debts', to: '/debts', icon: CreditCard },
  { label: 'Investments', to: '/investments', icon: BriefcaseBusiness },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'AI Assistant', to: '/ai', icon: ShieldCheck },
  { label: 'Settings', to: '/settings', icon: Settings },
];

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Users',
  '/categories': 'Categories',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/savings': 'Savings',
  '/goals': 'Goals',
  '/recurring-transactions': 'Recurring Transactions',
  '/debts': 'Debts',
  '/investments': 'Investments',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/ai': 'AI Assistant',
  '/settings': 'Settings',
};

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full min-h-0 w-[270px] shrink-0 flex-col border-r border-slate-200/80 bg-[#04172A] text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#14BBA6] shadow-lg shadow-[#14BBA6]/20">
          <WalletCards className="h-5 w-5 text-[#04172A]" />
        </div>
        <div>
          <p className="text-lg font-black tracking-[0.18em]">QORSHE</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Admin Console</p>
        </div>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-[#14BBA6] text-[#04172A] shadow-lg shadow-[#14BBA6]/10' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/60">
          <UserRound className="h-4 w-4" />
          <span className="text-xs">Administrator access</span>
        </div>
      </div>
    </aside>
  );
}

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const title = titles[location.pathname] ?? 'Admin Console';

  async function logout() {
    await dispatch(adminLogout());
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFA] text-[#04172A]">
      <div className="hidden h-full lg:flex"><Sidebar /></div>
      {drawerOpen && <div className="fixed inset-0 z-40 bg-[#04172A]/50 lg:hidden" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}
      <div className={`fixed inset-y-0 left-0 z-50 h-full transition-transform duration-200 lg:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative h-full"><Sidebar onNavigate={() => setDrawerOpen(false)} /><button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close navigation" className="absolute right-3 top-5 rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button></div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
            <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#14BBA6]">QORSHE Admin</p><h1 className="truncate text-xl font-bold text-[#04172A] sm:text-2xl">{title}</h1></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold text-[#04172A]">{user?.name ?? 'Administrator'}</p><p className="text-xs text-slate-500">{user?.email ?? 'Admin account'}</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F8F3] text-sm font-bold text-[#087D70]" aria-label="Admin profile">{(user?.name ?? 'A').slice(0, 1).toUpperCase()}</div>
            <button type="button" onClick={logout} className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:flex"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
