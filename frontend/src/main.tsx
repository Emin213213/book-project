import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/styles/variables.css';
import './app/styles/reset.css';
import App from './app/App.tsx';
import { useUserStore } from './modules/user/model/useUserStore';
import { configureApiClient } from './shared/api/apiClient';
import { queryClient } from './app/providers/queryClient';

const disconnectApiClient = configureApiClient(
  () => useUserStore.getState().accessToken,
  () => {
    useUserStore.getState().logout();
    queryClient.clear();
  },
);
import.meta.hot?.dispose(disconnectApiClient);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
