import { useEffect, useState } from 'react';
import { usersApi, type AdminUserRecord } from '../api/users.api';

const statuses = ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'] as const;
const roles = ['USER', 'ADMIN'] as const;
type Status = typeof statuses[number];
type Role = typeof roles[number];
type UserDetails = AdminUserRecord & { _count: Record<string, number> };

export function Users() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [selected, setSelected] = useState<UserDetails | null>(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [status, setStatus] = useState<Status | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    usersApi.list({ page, limit: 20, search: debouncedSearch || undefined, role: role || undefined, status: status || undefined })
      .then((result) => { if (!cancelled) { setUsers(result.data); setTotal(result.pagination.total); setTotalPages(result.pagination.totalPages); } })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load users.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, debouncedSearch, role, status]);

  async function viewUser(id: string) {
    try { setSelected(await usersApi.get(id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load user details.'); }
  }

  async function changeStatus(user: AdminUserRecord, nextStatus: Status) {
    if (user.status === nextStatus || !window.confirm(`Change ${user.name}'s status to ${nextStatus}?`)) return;
    try {
      const updated = await usersApi.updateStatus(user.id, nextStatus);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      if (selected?.id === updated.id) setSelected((current) => current ? { ...current, ...updated } : current);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update user status.'); }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFA] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#14BBA6]">QORSHE Admin</p><h1 className="mt-2 text-4xl font-bold text-[#04172A]">Users</h1><p className="mt-2 text-slate-600">Manage account profiles and lifecycle status.</p></div>
          <p className="text-sm text-slate-500">{total} total users</p>
        </div>
        <div className="mb-5 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-4">
          <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Search users…" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="rounded-xl border border-slate-200 px-4 py-3" value={role} onChange={(event) => { setRole(event.target.value as Role | ''); setPage(1); }}><option value="">All roles</option>{roles.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select className="rounded-xl border border-slate-200 px-4 py-3" value={status} onChange={(event) => { setStatus(event.target.value as Status | ''); setPage(1); }}><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <div className="flex items-center justify-end text-sm text-slate-500">Page {page} of {Math.max(totalPages, 1)}</div>
        </div>
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {loading ? <div className="p-10 text-center text-slate-500">Loading users…</div> : users.length === 0 ? <div className="p-10 text-center text-slate-500">{debouncedSearch ? 'No users match your search.' : 'No users found.'}</div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['Name', 'Email', 'Phone', 'Role', 'Status', 'Language', 'Currency', 'Actions'].map((heading) => <th className="px-5 py-4" key={heading}>{heading}</th>)}</tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4 font-semibold text-[#04172A]">{user.name}</td><td className="px-5 py-4 text-slate-600">{user.email}</td><td className="px-5 py-4 text-slate-600">{user.phone || '—'}</td><td className="px-5 py-4">{user.role}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{user.status}</span></td><td className="px-5 py-4">{user.preferredLanguage}</td><td className="px-5 py-4">{user.preferredCurrency}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-2"><button className="font-semibold text-[#0E8E72]" onClick={() => viewUser(user.id)}>Details</button><select className="rounded-lg border border-slate-200 px-2 py-1 text-xs" value={user.status} onChange={(event) => changeStatus(user, event.target.value as Status)}><option value="ACTIVE">Activate</option><option value="SUSPENDED">Suspend</option><option value="DEACTIVATED">Deactivate</option></select></div></td></tr>)}</tbody></table></div>}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Next</button></div>
        </div>
        {selected && <div className="fixed inset-0 flex items-center justify-center bg-[#04172A]/40 p-6" onClick={() => setSelected(null)}><div className="w-full max-w-lg rounded-2xl bg-white p-7" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-sm uppercase tracking-wide text-[#14BBA6]">User Details</p><h2 className="mt-2 text-2xl font-bold text-[#04172A]">{selected.name}</h2></div><button className="text-slate-500" onClick={() => setSelected(null)}>Close</button></div><div className="mt-6 grid grid-cols-2 gap-4 text-sm"><Info label="Email" value={selected.email} /><Info label="Phone" value={selected.phone || 'Not set'} /><Info label="Role" value={selected.role} /><Info label="Status" value={selected.status} /><Info label="Language" value={selected.preferredLanguage} /><Info label="Currency" value={selected.preferredCurrency} /><Info label="Transactions" value={String(selected._count.transactions)} /><Info label="Budgets" value={String(selected._count.budgets)} /><Info label="Savings Goals" value={String(selected._count.savingsGoals)} /><Info label="Financial Goals" value={String(selected._count.financialGoals)} /></div></div></div>}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-medium text-[#04172A]">{value}</p></div>; }
