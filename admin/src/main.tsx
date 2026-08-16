import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store/store';
import { restoreAdminSession } from './store/authSlice';
import { AppRouter } from './routes/AppRouter';
import './index.css';

function SessionBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(restoreAdminSession()); }, [dispatch]);
  return <AppRouter />;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Provider store={store}><SessionBootstrap /></Provider></StrictMode>);
