import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { adminLogout } from '../store/authSlice';

export function Home() {
  const dispatch = useAppDispatch(); const navigate = useNavigate(); const user = useAppSelector((state) => state.auth.user);
  async function logout() { await dispatch(adminLogout()); navigate('/login', { replace: true }); }
  return <main className="min-h-screen bg-[#F8FAFA] px-6 py-16"><section className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-xl shadow-[#04172A]/5"><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#14BBA6]">QORSHE Admin</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-[#04172A]">Project foundation is ready.</h1></div><button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-[#04172A] hover:border-[#10B981]" onClick={logout}>Logout</button></div><p className="max-w-xl text-lg leading-8 text-slate-600">Authenticated admin foundation is connected to the shared backend. Future management modules will be added later.</p>{user && <p className="mt-6 text-sm text-slate-500">Signed in as {user.name} ({user.email}).</p>}</section></main>;
}
