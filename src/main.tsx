
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/theme-provider';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider defaultTheme="light">
        <App />
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);
