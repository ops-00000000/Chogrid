import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Компоненты
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Страницы
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTable from './pages/CreateTable';
import EditTable from './pages/EditTable';
import TableView from './pages/TableView';
import PublicTables from './pages/PublicTables';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// Импортируем компонент страницы с результатами таблицы
// import TableResults from './pages/TableResults';

// Контекст
import { AuthProvider, AuthContext } from './context/AuthContext';

// Создание темы Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      light: '#6573c3',
      dark: '#2c387e',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

// Создание глобального обработчика ошибок
if (process.env.NODE_ENV !== 'production') {
  window.addEventListener('error', function(event) {
    console.error('Глобальная ошибка:', event.error);
  });

  // Отслеживание необработанных Promise rejection
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Необработанное отклонение Promise:', event.reason);
  });
}

// Компонент для отладки аутентификации
const AuthDebugger = () => {
  const { user, isAuthenticated } = React.useContext(AuthContext);
  const location = useLocation();
  
  useEffect(() => {
    console.log('Текущий маршрут:', location.pathname);
    console.log('Состояние аутентификации:', isAuthenticated ? 'Аутентифицирован' : 'Не аутентифицирован');
    if (user) {
      console.log('Пользователь в AuthContext:', user);
    }
  }, [location.pathname, user, isAuthenticated]);
  
  return null;
};

const App = () => {
  useEffect(() => {
    console.log('Приложение работает в режиме', process.env.NODE_ENV);
    
    // Получаем все маршруты
    const routes = [
      '/',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password/:resetToken',
      '/dashboard',
      '/create-table',
      '/edit-table/:id',
      '/table/:id',
      '/public-tables',
      '/results/:id'
    ];
    
    console.log('Текущие маршруты:', routes);
  }, []);
  
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Header />
          <AuthDebugger /> {/* Добавим отладчик */}
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/create-table" element={<PrivateRoute><CreateTable /></PrivateRoute>} />
              <Route path="/edit-table/:id" element={<PrivateRoute><EditTable /></PrivateRoute>} />
              <Route path="/table/:id" element={<TableView />} />
              <Route path="/public-tables" element={<PublicTables />} />
              {/* Маршрут для страницы с результатами (временно использует TableView) */}
              <Route path="/results/:id" element={<TableView />} />
              {/* Маршрут для любых путей, которые не были найдены */}
              <Route path="*" element={
                <div style={{ 
                  textAlign: 'center', 
                  padding: '50px', 
                  marginTop: '100px' 
                }}>
                  <h2>Страница не найдена</h2>
                  <p>Запрошенная страница не существует.</p>
                  <button 
                    onClick={() => window.history.back()}
                    style={{
                      padding: '10px 20px',
                      marginTop: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    Вернуться назад
                  </button>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
          <ToastContainer 
            position="bottom-right" 
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
};

// Компонент для защищенных маршрутов
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);
  const token = localStorage.getItem('token');
  
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated);
  console.log('PrivateRoute - token:', token ? 'Существует' : 'Отсутствует');
  console.log('PrivateRoute - loading:', loading);
  
  if (loading) {
    return <div>Загрузка...</div>;
  }
  
  return (isAuthenticated || token) ? children : <Navigate to="/login" />;
};

export default App; 