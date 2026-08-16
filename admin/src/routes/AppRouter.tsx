import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return <BrowserRouter><Routes><Route path="/login" element={<Login />} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<Home />} /><Route path="/users" element={<Home />} /><Route path="/transactions" element={<Home />} /><Route path="/categories" element={<Home />} /><Route path="/budgets" element={<Home />} /><Route path="/savings" element={<Home />} /><Route path="/goals" element={<Home />} /><Route path="/notifications" element={<Home />} /><Route path="/settings" element={<Home />} /></Route><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></BrowserRouter>;
}
