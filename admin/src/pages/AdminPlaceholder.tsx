import { Construction } from 'lucide-react';

export function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return <div className="flex min-h-full items-center justify-center p-6 sm:p-10"><section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F8F3] text-[#087D70]"><Construction className="h-7 w-7" /></div><p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#14BBA6]">QORSHE Admin</p><h2 className="mt-2 text-2xl font-black text-[#04172A]">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p><p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">No mock data is shown here. This workspace will use a secure backend contract when implemented.</p></section></div>;
}
