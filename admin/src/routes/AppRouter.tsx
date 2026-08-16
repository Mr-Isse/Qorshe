import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Users } from '../pages/Users';
import { Categories } from '../pages/Categories';
import { Transactions } from '../pages/Transactions';
import { Budgets } from '../pages/Budgets';
import { Savings } from '../pages/Savings';
import { Goals } from '../pages/Goals';
import { RecurringTransactions } from '../pages/RecurringTransactions';
import { Notifications } from '../pages/Notifications';
import { Reports } from '../pages/Reports';
import { Debts } from '../pages/Debts';
import { Investments } from '../pages/Investments';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return <BrowserRouter><Routes><Route path="/login" element={<Login />} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<Home />} /><Route path="/users" element={<Users />} /><Route path="/categories" element={<Categories />} /><Route path="/transactions" element={<Transactions />} /><Route path="/budgets" element={<Budgets />} /><Route path="/savings" element={<Savings />} /><Route path="/goals" element={<Goals />} /><Route path="/recurring-transactions" element={<RecurringTransactions />} /><Route path="/notifications" element={<Notifications />} /><Route path="/reports" element={<Reports />} /><Route path="/debts" element={<Debts />} /><Route path="/investments" element={<Investments />} /><Route path="/settings" element={<Home />} /></Route><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></BrowserRouter>;
}
