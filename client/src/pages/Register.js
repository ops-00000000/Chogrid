import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Alert 
} from '@mui/material';
import { AuthContext } from '../utils/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { name, email, password, confirmPassword } = formData;
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');
    
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Ошибка при регистрации. Пожалуйста, попробуйте еще раз'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Регистрация
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Имя"
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              autoFocus
            />
            
            <TextField
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            
            <TextField
              label="Пароль"
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
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
            >
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Уже есть аккаунт?{' '}
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

export default Register; 