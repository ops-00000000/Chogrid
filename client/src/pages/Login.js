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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { email, password } = formData;
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Ошибка при входе. Пожалуйста, попробуйте еще раз'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Вход в аккаунт
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              autoFocus
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
              {isSubmitting ? 'Загрузка...' : 'Войти'}
            </Button>
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Еще нет аккаунта?{' '}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  Зарегистрироваться
                </Link>
              </Typography>
              
              <Typography variant="body2" mt={1}>
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  Забыли пароль?
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 