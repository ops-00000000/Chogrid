import React, { useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { AuthContext } from '../utils/AuthContext';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { password, confirmPassword } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    // Проверка длины пароля
    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await resetPassword(password, resetToken);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Ошибка при сбросе пароля. Возможно, ссылка недействительна или истек срок ее действия.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Создание нового пароля
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Введите новый пароль для вашей учетной записи.
            </Typography>
            
            <TextField
              label="Новый пароль"
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              autoFocus
              helperText="Пароль должен содержать не менее 6 символов"
            />
            
            <TextField
              label="Подтверждение пароля"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить новый пароль'}
            </Button>
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Вспомнили пароль?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Войти
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword; 